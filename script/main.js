let selectedFiles = []; // 選択されたファイルを管理する配列
let mergedPdfBytes = null; // 結合されたPDFのバイトデータ
const dropZone = document.getElementById('dropZone');
const fileList = document.getElementById('fileList');
let fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.multiple = true;
fileInput.accept = 'application/pdf'; // PDFファイルのみを受け入れる
fileInput.addEventListener('change', handleFiles);

dropZone.addEventListener('dragover', (event) => {
    event.preventDefault(); // デフォルトの動作をキャンセル
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (event) => {
    event.preventDefault(); // デフォルトの動作をキャンセル
    dropZone.classList.remove('dragover');
    handleFiles(event);
});

fileList.addEventListener('drop', (event) => {
    event.preventDefault(); // デフォルトの動作をキャンセル
});

function clearAllFiles() {
    selectedFiles = []; // 選択されたファイルをリセット
    const fileContainer = document.getElementById('fileContainer');
    fileContainer.innerHTML = ''; // 表示をクリア
    hiddenPDF(); // PDFを非表示にする
}

function handleFiles(event) {  
    const files = event.dataTransfer ? event.dataTransfer.files : event.target.files;  
    if (files.length > 0) {  
        // 既存のファイルリストに新しいファイルを追加  
        for (let i = 0; i < files.length; i++) {  
        if (files[i].type === 'application/pdf') {  
            selectedFiles.push(files[i]);  
        }  
        }  
        displayFileList();  
    }  
}
function moveFileUp(index) {  
    if (index > 0) {  
        const temp = selectedFiles[index];  
        selectedFiles[index] = selectedFiles[index - 1];  
        selectedFiles[index - 1] = temp;  
        displayFileList();  
    }  
}  
    
function moveFileDown(index) {  
    if (index < selectedFiles.length - 1) {  
        const temp = selectedFiles[index];  
        selectedFiles[index] = selectedFiles[index + 1];  
        selectedFiles[index + 1] = temp;  
        displayFileList();  
    }  
}  
    
function displayFileList() {
    const fileContainer = document.getElementById('fileContainer');  
    let containerHtml = '';  
      
    selectedFiles.forEach((file, index) => {  
      containerHtml += `  
        <div class="file-tile" draggable="true" data-index="${index}" id="file-${index}">  
          <button class="remove-btn" onclick="removeFile(${index})">×</button>  
          <div class="file-name">${file.name}</div>  
        </div>`;  
    });  
      
    fileContainer.innerHTML = containerHtml;  
      
    // ドラッグアンドドロップイベントを設定  
    setupDragAndDrop();  
}  
function setupDragAndDrop() {  
    const fileTiles = document.querySelectorAll('.file-tile');  
    const fileContainer = document.getElementById('fileContainer');  
      
    let draggedItem = null;  
      
    fileTiles.forEach(tile => {  
      // ドラッグ開始時  
      tile.addEventListener('dragstart', function(e) {  
        draggedItem = this;  
        setTimeout(() => this.classList.add('dragging'), 0);  
        e.dataTransfer.setData('text/plain', this.getAttribute('data-index'));  
      });  
        
      // ドラッグ終了時  
      tile.addEventListener('dragend', function() {  
        this.classList.remove('dragging');  
        fileTiles.forEach(tile => {  
          tile.classList.remove('drag-over');  
          tile.classList.remove('drag-over-bottom');  
        });  
      });  
        
      // ドラッグオーバー時  
      tile.addEventListener('dragover', function(e) {  
        e.preventDefault();  
        if (this === draggedItem) return;  
          
        const rect = this.getBoundingClientRect();  
        const midY = rect.top + rect.height / 2;  
          
        // マウスポインタの位置に基づいて、上半分か下半分かを判断  
        if (e.clientY < midY) {  
          this.classList.add('drag-over');  
          this.classList.remove('drag-over-bottom');  
        } else {  
          this.classList.add('drag-over-bottom');  
          this.classList.remove('drag-over');  
        }  
      });  
        
      // ドラッグリーブ時  
      tile.addEventListener('dragleave', function() {  
        this.classList.remove('drag-over');  
        this.classList.remove('drag-over-bottom');  
      });  
        
      // ドロップ時  
      tile.addEventListener('drop', function(e) {  
        e.preventDefault();  
        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));  
        const toIndex = parseInt(this.getAttribute('data-index'));  
          
        if (fromIndex === toIndex) return;  
          
        const rect = this.getBoundingClientRect();  
        const midY = rect.top + rect.height / 2;  
          
        // ドロップ位置に基づいて挿入位置を決定  
        let insertIndex;  
        if (e.clientY < midY) {  
          // 上半分にドロップした場合  
          insertIndex = toIndex;  
        } else {  
          // 下半分にドロップした場合  
          insertIndex = toIndex + 1;  
        }  
          
        // 配列の要素を移動  
        moveFile(fromIndex, insertIndex);  
          
        this.classList.remove('drag-over');  
        this.classList.remove('drag-over-bottom');  
      });  
    });  
    // コンテナ領域へのドロップも許可（空の領域へのドロップ）  
    fileContainer.addEventListener('dragover', function(e) {  
        e.preventDefault();  
    });  
        
    fileContainer.addEventListener('drop', function(e) {  
        // タイル以外の領域にドロップした場合は最後に追加  
        if (e.target === this) {  
        e.preventDefault();  
        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));  
        moveFile(fromIndex, selectedFiles.length);  
        }  
    });  
}

function moveFile(fromIndex, toIndex) {  
    // 移動元と移動先が同じ場合は何もしない  
    if (fromIndex === toIndex || fromIndex === toIndex - 1) return;  
      
    // 配列から要素を取り出す  
    const item = selectedFiles.splice(fromIndex, 1)[0];  
      
    // 移動先のインデックスを調整（fromIndexが削除されたため）  
    if (fromIndex < toIndex) {  
      toIndex--;  
    }  
      
    // 新しい位置に挿入  
    selectedFiles.splice(toIndex, 0, item);  
      
    // 表示を更新  
    displayFileList();
    hiddenPDF(); // PDFを非表示にする  
 
}

function removeFile(index) {  
    selectedFiles.splice(index, 1);  
    displayFileList();
    hiddenPDF(); // PDFを非表示にする  
}

async function displayPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    currentPdfBytes = arrayBuffer;
    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
    const pdfBytes = await pdfDoc.save();
    showPDF(pdfBytes);
}

async function mergePDFBtnClick() {  
    if (selectedFiles.length < 2) {  
      alert('結合するには少なくとも2つのPDFファイルを選択してください。');  
      return;  
    }  
    
    const arrayBuffers = [];  
    for (const file of selectedFiles) {  
      const arrayBuffer = await file.arrayBuffer();  
      arrayBuffers.push(arrayBuffer);  
    }  
    
    mergedPdfBytes = await mergePDFs(arrayBuffers);  
    showPDF(mergedPdfBytes);  
    // PDFが生成されたらダウンロードボタンを有効化  
    document.getElementById('downloadPdfBtn').disabled = false;  
}

async function mergePDFs(pdfArrayBuffers) {
    const mergedPdf = await PDFLib.PDFDocument.create();
    
    for (const pdfArrayBuffer of pdfArrayBuffers) {
        const pdf = await PDFLib.PDFDocument.load(pdfArrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => {
        mergedPdf.addPage(page);
        });
    }

    const pdfBytes = await mergedPdf.save();
    return pdfBytes;
}

function showPDF(data) {
    const blob = new Blob([data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const pdfViewer = document.getElementById('pdfViewer');
    pdfViewer.src = url;
}

function hiddenPDF() {
  const pdfViewer = document.getElementById('pdfViewer');
  pdfViewer.src = ''; // PDFを非表示にするためにsrcを空にする
  document.getElementById('downloadPdfBtn').disabled = true;  // ダウンロードボタンを無効化  

}

function download(data, filename) {
    const blob = new Blob([data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
