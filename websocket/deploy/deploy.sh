#!/bin/bash

DEPLOY_ENV="mura_server_local"
DEPLOY_ROOT_DIR="~/poke26/websocket"

DEPLOY_DOCKER_DIR="~/poke26/docker"
DEPLOY_DOCKER_CONTAINER="websocket"

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
PARENT_DIR=$(dirname "${SCRIPT_DIR}")

cd $PARENT_DIR

files=()
for f in *; do
    case "$f" in
        deploy|vendor|composer.phar|.gitignore)
            ;;
        *)
            files+=("$f")
            ;;
    esac
done

echo "--- Deleting ---"
ssh ${DEPLOY_ENV} "rm -rf ${DEPLOY_ROOT_DIR}/*"
echo "--- mkdir ---"
ssh ${DEPLOY_ENV} "mkdir -p ${DEPLOY_ROOT_DIR}"
echo "--- Deploy ---"
scp -r "${files[@]}" "${DEPLOY_ENV}:${DEPLOY_ROOT_DIR}"
echo "--- Deploy[Docker build and up] ---"
ssh ${DEPLOY_ENV} "cd ${DEPLOY_DOCKER_DIR} && docker compose up -d --build ${DEPLOY_DOCKER_CONTAINER}"

# cd $PARENT_DIR

# echo "--- Building ---"
# npm run build

# echo "--- Deleting ---"
# ssh ${DEPLOY_ENV} "rm -rf ${dest_dir}/*"
# ssh ${DEPLOY_ENV} "rm -rf ${dest_ws_dir}/*"
# echo "--- mkdir ---"
# ssh ${DEPLOY_ENV} "mkdir -p ${dest_dir}"

# echo "--- front ---"
# scp -r ${src_dir} "${DEPLOY_ENV}:${dest_dir}"
# echo "---  api  ---"
# scp -r ${src_api_dir} "${DEPLOY_ENV}:${dest_api_dir}"
# echo "permission change"
# ssh ${DEPLOY_ENV} "chmod 755 ${dest_api_dir}"

# echo "---  websocket  ---"
# scp -r ${src_ws_dir} "${DEPLOY_ENV}:${dest_ws_dir}"
# echo "permission change"
# ssh ${DEPLOY_ENV} "chmod 755 ${dest_ws_dir}"

# echo "Done"