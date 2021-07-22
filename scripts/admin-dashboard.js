/* Socket.io */
const mainProcessBar = document.getElementById('main-process-bar');
const mainPercentage = document.getElementById('main-percentage');
const mainBar = document.getElementById('main-bar');
const mainHeadline = document.getElementById('main-headline');
const mainP = document.getElementById('main-p');
const mainButtonSection = document.getElementById('main-button-section');
const previewContent = document.getElementById('preview-content');
const contentContainer = document.getElementById('content-container');

const socket = io(window.location.href);
socket.on('connection');

function selectInNav(options) {
    openNav('open'); // closes nav
    socket.emit('selectInNav', options);
}

function getPreviewContent(options) {
    socket.emit('getPreviewContent', options);
}

function showEventInPreview(options) {
    if (!window.matchMedia('(min-width: 680px)').matches) openPreview('close'); // opens preview
    getPreviewContent(options);
}

let navState = 'open';
let previewState = 'close';

function openNav(forceNavState) {
    navState = forceNavState || navState;

    if (navState == 'close') {
        navState = 'open';
        contentContainer.className = `nav-open preview-${previewState}`;
    } else {
        navState = 'close';
        contentContainer.className = `nav-close preview-${previewState}`;
    }
}

function openPreview() {
    if (previewState == 'close') {
        previewState = 'open';
        contentContainer.className = `nav-${navState} preview-open`;
    } else {
        previewState = 'close';
        contentContainer.className = `nav-${navState} preview-close`;
    }
}

function replaceContent(sourceId, destinationId, convertOption) {
    const source = document.getElementById(sourceId);
    const destination = document.getElementById(destinationId);

    if (!destination || !source) return;

    switch (convertOption) {
        case 'fullDateString':
            destination.innerHTML = source.value + (source.value.split(' ')[1] ? ' Uhr' : '');
            break;
        case 'fullPreview':
            getPreviewContent({ _id: source.value });
            break;
        default:
            destination.innerHTML = source.value;
    }
}

function setup(options) {
    let inputContainer = document.getElementById('input-container');
    let fileUploadInput = document.getElementsByClassName('file-upload-input')[0];
    let fileName = document.getElementsByClassName('file-name')[0];
    let children = inputContainer?.children;
    let inputDataArray = [];

    if (children) {
        let index = 1;
        let inputRadioIndex = 0;
        Array.from(children).forEach((child) => {
            if (child.id == 'upload-progress-box') {
                const tempArray0 = fileUploadInput.id.split(/\-(?=[^\-]+$)/);
                const tempArray1 = tempArray0[0].split(/\-(?=[^\-]+$)/);

                const width = tempArray1[1];
                const height = tempArray0[1];

                inputDataArray.push({ id: `${width}-${height}`, value: fileName?.innerHTML || 'KEINE NEUE DATEI' });
            } else if (index % 2 == 0) {
                if (child.className == 'input-radio') {
                    let inputRadioDiv = document.getElementsByClassName('input-radio')[inputRadioIndex];
                    let radioChildren = inputRadioDiv.children;

                    let id = '';
                    let value = '';
                    Array.from(radioChildren).forEach((radioChild) => {
                        id = radioChild.id;
                        if (radioChild.checked) value = radioChild.value;
                    });
                    inputDataArray.push({ id, value });
                    inputRadioIndex++;
                } else if (child.id) {
                    inputDataArray.push({ id: child.id, value: child.value });
                }
            }
            index++;
        });
    }

    options.inputs = inputDataArray;

    socket.emit('setup', options);
}

socket.on('sendPageContent', (data) => {
    let mainPercentageString = data.mainPercentage;
    if ((mainPercentageString == '-1%' || mainPercentageString == undefined) && mainPercentageString !== 'unchanged') {
        mainProcessBar.style.visibility = 'hidden';
        mainPercentage.innerHTML = '0%';
        mainBar.style.width = '0%';
    } else if (mainPercentageString !== 'unchanged') {
        mainProcessBar.style.visibility = 'visible';
        mainPercentage.innerHTML = mainPercentageString;
        mainBar.style.width = mainPercentageString;
    }

    if (data.mainHeadline !== undefined) mainHeadline.innerHTML = data.mainHeadline;
    if (data.mainP !== undefined) {
        mainProcessBar.scrollIntoView();
        mainP.innerHTML = data.mainP;
    }
    if (data.mainButtonSection !== undefined) mainButtonSection.innerHTML = data.mainButtonSection;
    if (data.previewContent !== undefined) previewContent.innerHTML = data.previewContent;
});

socket.on('sendCss', (data) => {
    let css = data.css;
    let head = document.head || document.getElementsByTagName('head')[0];
    let style = document.createElement('style');

    let styleTag = document.getElementById('local-style');
    if (styleTag) head.removeChild(styleTag);
    head.appendChild(style);

    style.id = 'local-style';
    style.type = 'text/css';
    if (style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }
});

socket.on('sendError', (data) => {
    window.alert(data.message);
});

/* * * * * * * * FILE UPLOAD SCRIPT * * * * * * * */

/* SOURCE: https://github.com/beforesemicolon/Projects/blob/development/multifile-uploader/uploader.js */

const uploadFiles = (() => {
    const fileRequests = new WeakMap();
    const ENDPOINTS = {
        UPLOAD: `/admin/file-uploader`,
        UPLOAD_STATUS: `/admin/file-uploader-status`,
        UPLOAD_REQUEST: `/admin/file-uploader-request`
    };
    const defaultOptions = {
        url: ENDPOINTS.UPLOAD,
        startingByte: 0,
        fileName: '',
        onAbort() {},
        onProgress() {},
        onError() {},
        onComplete() {}
    };

    const uploadFileChunks = (file, options) => {
        const formData = new FormData();
        const req = new XMLHttpRequest();
        const chunk = file.slice(options.startingByte);

        formData.append('chunk', chunk, file.name);
        formData.append('fileName', options.fileName);

        req.open('POST', options.url, true);
        req.setRequestHeader(
            'Content-Range',
            `bytes=${options.startingByte}-${options.startingByte + chunk.size}/${file.size}`
        );
        req.setRequestHeader('X-File-Name', options.fileName);

        req.onload = (e) => {
            // it is possible for load to be called when the request status is not 200
            // this will treat 200 only as success and everything else as failure
            if (req.status === 200) {
                options.onComplete(e, file);
            } else {
                options.onError(e, file);
            }
        };

        req.upload.onprogress = (e) => {
            const loaded = options.startingByte + e.loaded;
            options.onProgress({ ...e, loaded, total: file.size, percentage: (loaded * 100) / file.size }, file);
        };

        req.ontimeout = (e) => options.onError(e, file);

        req.onabort = (e) => options.onAbort(e, file);

        req.onerror = (e) => options.onError(e, file);

        fileRequests.get(file).request = req;

        req.send(formData);
    };

    const uploadFile = (file, options) => {
        return fetch(`${ENDPOINTS.UPLOAD_REQUEST}${window.location.search}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fileName: file.name
            })
        })
            .then((res) => res.json())
            .then((res) => {
                options = { ...options, ...res };
                fileRequests.set(file, { request: null, options });

                uploadFileChunks(file, options);
            })
            .catch((e) => {
                options.onError({ ...e, file });
            });
    };

    const abortFileUpload = async (file) => {
        const fileReq = fileRequests.get(file);

        if (fileReq && fileReq.request) {
            fileReq.request.abort();
            return true;
        }

        return false;
    };

    const retryFileUpload = (file) => {
        const fileReq = fileRequests.get(file);

        if (fileReq) {
            // try to get the status just in case it failed mid upload
            return fetch(`${ENDPOINTS.UPLOAD_STATUS}?fileName=${file.name}`)
                .then((res) => res.json())
                .then((res) => {
                    // if uploaded we continue
                    uploadFileChunks(file, { ...fileReq.options, startingByte: Number(res.totalChunkUploaded) });
                })
                .catch(() => {
                    // if never uploaded we start
                    uploadFileChunks(file, fileReq.options);
                });
        }
    };

    const clearFileUpload = async (file) => {
        const fileReq = fileRequests.get(file);

        if (fileReq) {
            await abortFileUpload(file);
            fileRequests.delete(file);

            return true;
        }

        return false;
    };

    const resumeFileUpload = (file) => {
        const fileReq = fileRequests.get(file);

        if (fileReq) {
            return fetch(`${ENDPOINTS.UPLOAD_STATUS}?fileName=${file.name}`)
                .then((res) => res.json())
                .then((res) => {
                    uploadFileChunks(file, { ...fileReq.options, startingByte: Number(res.totalChunkUploaded) });
                })
                .catch((e) => {
                    fileReq.options.onError({ ...e, file });
                });
        }
    };

    return (files, options = defaultOptions) => {
        [...files].forEach((file) => uploadFile(file, { ...defaultOptions, ...options }));

        return {
            abortFileUpload,
            retryFileUpload,
            clearFileUpload,
            resumeFileUpload
        };
    };
})();

const uploadAndTrackFiles = (() => {
    const files = new Map();
    const progressBox = document.createElement('div');
    const FILE_STATUS = {
        PENDING: 'Ausstehend',
        UPLOADING: 'Hochladen',
        PAUSED: 'Pausiert',
        COMPLETED: 'Fertig',
        FAILED: 'Fehler'
    };
    let uploader = null;

    progressBox.className = 'upload-progress-tracker';
    progressBox.innerHTML = `
				<div class="uploads-progress-bar" style="width: 100%;"></div>
				<div class="file-progress-wrapper"></div>
			`;

    const updateProgressBox = () => {
        const [title, uploadProgress, expandBtn, progressBar] = progressBox.children;

        if (files.size > 0) {
            let totalUploadedFiles = 0;
            let totalUploadingFiles = 0;
            let totalFailedFiles = 0;
            let totalPausedFiles = 0;
            let totalChunkSize = 0;
            let totalUploadedChunkSize = 0;
            const [uploadedPerc, successCount, failedCount, pausedCount] = uploadProgress.children;

            files.forEach((fileObj) => {
                if (fileObj.status === FILE_STATUS.FAILED) {
                    totalFailedFiles += 1;
                } else {
                    if (fileObj.status === FILE_STATUS.COMPLETED) {
                        totalUploadedFiles += 1;
                    } else if (fileObj.status === FILE_STATUS.PAUSED) {
                        totalPausedFiles += 1;
                    } else {
                        totalUploadingFiles += 1;
                    }

                    totalChunkSize += fileObj.size;
                    totalUploadedChunkSize += fileObj.uploadedChunkSize;
                }
            });

            const percentage =
                totalChunkSize > 0 ? Math.min(100, Math.floor((totalUploadedChunkSize * 100) / totalChunkSize)) : 0;

            title.textContent = `${totalUploadedFiles}/${files.size} Datei${files.size !== 1 ? 'en' : ''} hochgeladen`;
            //uploadedPerc.textContent = `${percentage}%`;
            //successCount.textContent = totalUploadedFiles;
            //failedCount.textContent = totalFailedFiles;
            //pausedCount.textContent = totalPausedFiles;
            progressBox.style.backgroundSize = `${percentage}%`;
            //expandBtn.style.display = 'inline-block';
            uploadProgress.style.display = 'block';
            //progressBar.style.display = 'block';
        } else {
            title.textContent = 'Warteschlange ist leer';
            expandBtn.style.display = 'none';
            uploadProgress.style.display = 'none';
            //progressBar.style.display = 'none';
        }
    };

    const updateFileElement = (fileObject) => {
        const [
            {
                children: [
                    {
                        children: [status]
                    },
                    progressBar
                ]
            }, // .file-details
            {
                children: [retryBtn, pauseBtn, resumeBtn, clearBtn]
            } // .file-actions
        ] = fileObject.element.children;

        requestAnimationFrame(() => {
            status.textContent =
                fileObject.status === FILE_STATUS.COMPLETED
                    ? fileObject.status
                    : `${Math.floor(fileObject.percentage)}%`;
            status.className = `status ${fileObject.status}`;
            progressBar.style.width = fileObject.percentage + '%';
            progressBar.style.background =
                fileObject.status === FILE_STATUS.COMPLETED
                    ? 'var(--success-fill)'
                    : fileObject.status === FILE_STATUS.FAILED
                    ? 'var(--danger-fill)'
                    : 'var(--others-fill)';
            pauseBtn.style.display = fileObject.status === FILE_STATUS.UPLOADING ? 'inline-block' : 'none';
            retryBtn.style.display = fileObject.status === FILE_STATUS.FAILED ? 'inline-block' : 'none';
            resumeBtn.style.display = fileObject.status === FILE_STATUS.PAUSED ? 'inline-block' : 'none';
            clearBtn.style.display = fileObject.status === FILE_STATUS.PAUSED ? 'inline-block' : 'none';

            updateProgressBox();
        });
    };

    const setFileElement = (file) => {
        //const extIndex = file.name.lastIndexOf('.');

        progressBox.querySelector('.file-progress-wrapper').innerHTML = '';

        const fileElement = document.createElement('div');
        fileElement.className = 'file-progress';
        fileElement.innerHTML = `
			<div class="file-details" style="position: relative">
				<p>
					<span class="status">pending</span>
					<span class="file-name">${file.name}</span>
				</p>
				<div class="progress-bar" style="width: 0;"></div>
			</div>
			<div class="file-actions">
				<button type="button" class="retry-btn" style="display: none">Erneut versuchen</button>
				<button type="button" class="cancel-btn" style="display: none">Pausieren</button>
				<button type="button" class="resume-btn" style="display: none">Fortfahren</button>
				<button type="button" class="clear-btn" style="display: none">Löschen</button>
			</div>
		`;
        files.set(file, {
            element: fileElement,
            size: file.size,
            status: FILE_STATUS.PENDING,
            percentage: 0,
            uploadedChunkSize: 0
        });

        const [
            _,
            {
                children: [retryBtn, pauseBtn, resumeBtn, clearBtn]
            }
        ] = fileElement.children;

        clearBtn.addEventListener('click', () => {
            uploader.clearFileUpload(file);
            files.delete(file);
            fileElement.remove();
            updateProgressBox();
        });
        retryBtn.addEventListener('click', () => uploader.retryFileUpload(file));
        pauseBtn.addEventListener('click', () => uploader.abortFileUpload(file));
        resumeBtn.addEventListener('click', () => uploader.resumeFileUpload(file));
        progressBox.querySelector('.file-progress-wrapper').appendChild(fileElement);
    };

    const onComplete = (e, file) => {
        const fileObj = files.get(file);

        fileObj.status = FILE_STATUS.COMPLETED;
        fileObj.percentage = 100;

        updateFileElement(fileObj);

        let fileNameElements = document.getElementsByClassName('file-name');
        Array.from(fileNameElements).forEach((element) => {
            socket.emit('transcodeUploadedFile', { fileName: element.innerHTML });
        });
    };

    const onProgress = (e, file) => {
        const fileObj = files.get(file);

        fileObj.status = FILE_STATUS.UPLOADING;
        fileObj.percentage = e.percentage;
        fileObj.uploadedChunkSize = e.loaded;

        updateFileElement(fileObj);
    };

    const onError = (e, file) => {
        const fileObj = files.get(file);

        fileObj.status = FILE_STATUS.FAILED;
        fileObj.percentage = 100;

        updateFileElement(fileObj);
    };

    const onAbort = (e, file) => {
        const fileObj = files.get(file);

        fileObj.status = FILE_STATUS.PAUSED;

        updateFileElement(fileObj);
    };

    return (uploadedFiles) => {
        [...uploadedFiles].forEach(setFileElement);

        document.getElementById('upload-progress-box').appendChild(progressBox);

        uploader = uploadFiles(uploadedFiles, {
            onProgress,
            onError,
            onAbort,
            onComplete
        });
    };
})();

function FileListItems(files) {
    var b = new ClipboardEvent('').clipboardData || new DataTransfer();
    for (var i = 0, len = files.length; i < len; i++) b.items.add(files[i]);
    return b.files;
}

function onChangeFileInput() {
    const fileInput = document.getElementsByClassName('file-upload-input')[0];
    const id = fileInput.id;

    let fileArray = [];

    Array.from(fileInput.files).forEach((file) => {
        const fileExtention = file.name.split(/\.(?=[^\.]+$)/)[1];

        const renamedFile = new File([file], `${id}.orig.${fileExtention}`);
        fileArray.push(renamedFile);
    });

    fileInput.files = new FileListItems(fileArray);

    uploadAndTrackFiles(fileInput.files);
    fileInput.value = '';
}
