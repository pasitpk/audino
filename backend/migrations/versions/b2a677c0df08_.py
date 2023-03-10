"""empty message

Revision ID: b2a677c0df08
Revises: b60bb67d1758
Create Date: 2023-01-07 05:53:44.247557

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b2a677c0df08'
down_revision = 'b60bb67d1758'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('data', sa.Column('youtube_end_time', sa.Integer(), nullable=True))
    op.add_column('data', sa.Column('youtube_start_time', sa.Integer(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('data', 'youtube_start_time')
    op.drop_column('data', 'youtube_end_time')
    # ### end Alembic commands ###
