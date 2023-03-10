import axios from "axios";
import React from "react";
import { sortBy } from "lodash";
import { Helmet } from "react-helmet";
import { withRouter } from "react-router-dom";

import Loader from "../components/loader";

class Data extends React.Component {
  constructor(props) {
    super(props);

    const projectId = Number(this.props.match.params.id);

    const { location } = this.props;
    const params = new URLSearchParams(location.search);
    this.state = {
      projectId,
      data: [],
      filterKeyword: params.get("search") || "",
      active: params.get("active") || "all",
      page:
        params.get("page") ||
        localStorage.getItem(`${params.get("active") || "all"}:page`) ||
        1,
      count: {
        pending: 0,
        completed: 0,
        all: 0,
        marked_review: 0,
      },
      apiUrl: `/api/current_user/projects/${projectId}/data`,
      tabUrls: {
        pending: this.prepareUrl(
          projectId,
          localStorage.getItem("pending:page") || 1,
          "pending",
          params.get("search") || ""
        ),
        completed: this.prepareUrl(
          projectId,
          localStorage.getItem("completed:page") || 1,
          "completed",
          params.get("search") || ""
        ),
        all: this.prepareUrl(
          projectId,
          localStorage.getItem("all:page") || 1,
          "all",
          params.get("search") || ""
        ),
        marked_review: this.prepareUrl(
          projectId,
          localStorage.getItem("marked_review:page") || 1,
          "marked_review",
          params.get("search") || ""
        ),
      },
      nextPage: null,
      prevPage: null,
      isDataLoading: false,
      goToPage: "",
    };
  }

  prepareUrl(projectId, page, active, searchKeyword) {
    return `/projects/${projectId}/data?page=${page}&active=${active}&search=${searchKeyword}`;
  }

  handlePageChange(event) {
    if (event.key === "Enter") {
      const { projectId, active, filterKeyword, goToPage } = this.state;
      const newPageUrl = this.prepareUrl(
        projectId,
        goToPage,
        active,
        filterKeyword
      );
      this.props.history.push(newPageUrl);
      window.location.reload();
    }
  }

  componentDidMount() {
    this.setState({ isDataLoading: true });
    let { apiUrl, page, active } = this.state;
    apiUrl = `${apiUrl}?page=${page}&active=${active}`;

    axios({
      method: "get",
      url: apiUrl,
    })
      .then((response) => {
        const { data, count, active, page, next_page, prev_page } =
          response.data;
        const sortedData = sortBy(data, (d) => {
          const ext = d["original_filename"].split(".")[1];
          const temp = d["original_filename"].split(".")[0].split("_");
          const fname = temp.slice(0, temp.length - 1);
          const index = temp[temp.length - 1];
          const zeroPaddedFname = `${fname.join("_")}_${index.padStart(
            5,
            "0"
          )}.${ext}`;
          return zeroPaddedFname;
        });
        // If there is no data, set page to 1
        if (sortedData.length === 0) {
          localStorage.setItem(`${this.state.active}:page`, 1);
          this.setState({
            data: sortedData,
            count,
            active,
            page,
            nextPage: next_page,
            prevPage: prev_page,
            isDataLoading: false,
          });
        } else {
          this.setState({
            data: sortedData,
            count,
            active,
            page,
            nextPage: next_page,
            prevPage: prev_page,
            isDataLoading: false,
          });

          localStorage.setItem(`${active}:page`, page);
        }
      })
      .catch((error) => {
        this.setState({
          errorMessage: error.response.data.message,
          isDataLoading: false,
        });
      });
  }

  render() {
    const {
      projectId,
      isDataLoading,
      data,
      count,
      active,
      page,
      nextPage,
      prevPage,
      tabUrls,
      filterKeyword,
      goToPage,
    } = this.state;

    const nextPageUrl = this.prepareUrl(
      projectId,
      nextPage,
      active,
      filterKeyword
    );
    const prevPageUrl = this.prepareUrl(
      projectId,
      prevPage,
      active,
      filterKeyword
    );

    return (
      <div>
        <Helmet>
          <title>Data</title>
        </Helmet>
        <div className="container h-100">
          <div className="h-100 mt-5">
            <div className="row border-bottom my-3">
              <div className="col float-left">
                <h1>Data</h1>
              </div>
            </div>
            {!isDataLoading ? (
              <div>
                <div className="col justify-content-left my-3">
                  <ul className="nav nav-pills nav-fill">
                    <li className="nav-item">
                      <a
                        className={`nav-link ${
                          active === "all" ? "active" : null
                        }`}
                        href={tabUrls["all"]}
                      >
                        All ({count["all"]})
                      </a>
                    </li>
                    <li className="nav-item">
                      {/*  See: https://github.com/ReactTraining/react-router/issues/7293 */}
                      <a
                        className={`nav-link ${
                          active === "pending" ? "active" : null
                        }`}
                        href={tabUrls["pending"]}
                      >
                        Yet to annotate ({count["pending"]})
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        className={`nav-link ${
                          active === "completed" ? "active" : null
                        }`}
                        href={tabUrls["completed"]}
                      >
                        Annotated ({count["completed"]})
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        className={`nav-link ${
                          active === "marked_review" ? "active" : null
                        }`}
                        href={tabUrls["marked_review"]}
                      >
                        Marked for review ({count["marked_review"]})
                      </a>
                    </li>
                  </ul>
                </div>
                {data.length > 0 ? (
                  <table className="table table-striped text-center">
                    <thead>
                      <tr>
                        <th scope="col">File Name</th>
                        <th scope="col">No. of segmentations</th>
                        <th scope="col">Created On</th>
                        <div className="col-12 my-4 justify-content-center align-items-center text-center">
                          {prevPage ? (
                            <a className="col" href={prevPageUrl}>
                              Previous
                            </a>
                          ) : null}

                          {data.length !== 0 ? (
                            <span className="col">{page}/{Math.ceil(count[active]/100)}</span>
                          ) : null}
                          {nextPage ? (
                            <a className="col" href={nextPageUrl}>
                              Next
                            </a>
                          ) : null}
                          <hr />
                          <div className="col">
                            <span>Go To Page: </span>
                            <input
                              type="text"
                              style={{ textAlign: "center" }}
                              value={goToPage}
                              onChange={(e) =>
                                this.setState({ goToPage: e.target.value })
                              }
                              onKeyDown={(e) => this.handlePageChange(e)}
                            ></input>
                          </div>
                        </div>
                        {/* <input
                          value={this.state.filterKeyword}
                          onChange={(e) =>
                            this.setState({ filterKeyword: e.target.value })
                          }
                          type="text"
                          placeholder="Filter.."
                        ></input> */}
                      </tr>
                    </thead>
                    <tbody>
                      {data
                        .filter(
                          (x) =>
                            x["original_filename"].includes(
                              this.state.filterKeyword
                            ) || this.state.filterKeyword === ""
                        )
                        .map((data, index) => {
                          return (
                            <tr key={index}>
                              <td className="align-middle">
                                <a
                                  href={`/projects/${projectId}/data/${`${data["data_id"]}&${data["original_filename"]}&${data["youtube_start_time"]}&${this.state.page}&${this.state.active}`}/annotate`}
                                >
                                  {data["original_filename"]}
                                </a>
                              </td>
                              <td className="align-middle">
                                {data["number_of_segmentations"]}
                              </td>
                              <td className="align-middle">
                                {data["created_on"]}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="row my-4 justify-content-center align-items-center">
            {isDataLoading ? <Loader /> : null}
            {!isDataLoading && data.length === 0 ? (
              <div className="font-weight-bold">No data exists!</div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Data);
