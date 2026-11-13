#!/bin/bash

DEPLOY_ENV="mura_server_local"
DEPLOY_ROOT_DIR="~/poke26"
DEPLOY_DIR_NAME="docker"
# declare -A DEPLOY_SYMBOLIC_LINKS=(
#         ["api"]="api/app"
#         ["frontend"]="frontend/html"
#         ["websocket"]="websocket/app"
# )

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
PARENT_DIR=$(dirname "${SCRIPT_DIR}")

cd $PARENT_DIR

files=()
for f in *; do
    case "$f" in
        deploy)
            ;;
        *)
            files+=("$f")
            ;;
    esac
done

dest_dir="${DEPLOY_ROOT_DIR}/${DEPLOY_DIR_NAME}"

echo "--- Deleting ---"
ssh ${DEPLOY_ENV} "rm -rf ${dest_dir}/*"
echo "--- mkdir ---"
ssh ${DEPLOY_ENV} "mkdir -p ${dest_dir}"
echo "--- Deploy ---"
scp -r "${files[@]}" "${DEPLOY_ENV}:${dest_dir}"
# echo "--- Make symbolic links ---"
# for lnk in "${!DEPLOY_SYMBOLIC_LINKS[@]}"; do
#     ssh ${DEPLOY_ENV} "mkdir -p ${DEPLOY_ROOT_DIR}/${lnk} && ln -sf ${DEPLOY_ROOT_DIR}/${lnk} ${dest_dir}/${DEPLOY_SYMBOLIC_LINKS[${lnk}]}"
# done





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