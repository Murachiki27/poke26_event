#!/bin/bash


DEPLOY_DIR_NAME="poke26"

SRC_DIR_NAME="dist"
# SRC_API_DIR_NAME="server/api"
# SRC_WS_DIR_NAME="server/websocket"
DEPLOY_ENV="mura_server_local"
DEPLOY_ROOT_DIR="~/poke26/frontend"

DEPLOY_DOCKER_DIR="~/poke26/docker"
DEPLOY_DOCKER_CONTAINER="frontend"

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
PARENT_DIR=$(dirname "${SCRIPT_DIR}")
# DEPLOY_HTML_DIR="${DEPLOY_ROOT_DIR}/html"

src_dir="${PARENT_DIR}/${SRC_DIR_NAME}/*"
dest_dir="${DEPLOY_ROOT_DIR}/${DEPLOY_DIR_NAME}"

# src_api_dir="${PARENT_DIR}/${SRC_API_DIR_NAME}/*"
# dest_api_dir="${DEPLOY_HTML_DIR}/${DEPLOY_DIR_NAME}/api"

# src_ws_dir="${PARENT_DIR}/${SRC_WS_DIR_NAME}/*"
# dest_ws_dir="${DEPLOY_ROOT_DIR}/websocket/app"

cd $PARENT_DIR

echo "--- Building ---"
npm run build

echo "--- Deleting ---"
ssh ${DEPLOY_ENV} "rm -rf ${dest_dir}/*"
# ssh ${DEPLOY_ENV} "rm -rf ${dest_ws_dir}/*"
echo "--- mkdir ---"
ssh ${DEPLOY_ENV} "mkdir -p ${dest_dir}"

echo "--- front ---"
scp -r ${src_dir} "${DEPLOY_ENV}:${dest_dir}"
# echo "---  api  ---"
# scp -r ${src_api_dir} "${DEPLOY_ENV}:${dest_api_dir}"
# echo "permission change"
# ssh ${DEPLOY_ENV} "chmod 755 ${dest_api_dir}"

# echo "---  websocket  ---"
# scp -r ${src_ws_dir} "${DEPLOY_ENV}:${dest_ws_dir}"
# echo "permission change"
# ssh ${DEPLOY_ENV} "chmod 755 ${dest_ws_dir}"


echo "--- Deploy[Docker build and up] ---"
ssh ${DEPLOY_ENV} "cd ${DEPLOY_DOCKER_DIR} && docker compose up -d --build ${DEPLOY_DOCKER_CONTAINER}"

echo "Done"