#!/bin/bash

DEPLOY_DIR_NAME="poke26"

SRC_SQL_DIR_NAME="server/sql"
DEPLOY_ENV="mura_server_local"
DEPLOY_ROOT_DIR="~/poke26"

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
PARENT_DIR=$(dirname "${SCRIPT_DIR}")


src_sql_dir="${PARENT_DIR}/${SRC_SQL_DIR_NAME}/*"
dest_sql_dir="${DEPLOY_ROOT_DIR}/sql"

cd $PARENT_DIR

echo "=== DELETE SQL ==="
ssh ${DEPLOY_ENV} "rm -rf ${dest_sql_dir}/*"

echo "--- DEPLOY SQL ---"
scp -r ${src_sql_dir} "${DEPLOY_ENV}:${dest_sql_dir}"
echo "permission change"
ssh ${DEPLOY_ENV} "chmod 755 ${dest_sql_dir}"

echo "Done"