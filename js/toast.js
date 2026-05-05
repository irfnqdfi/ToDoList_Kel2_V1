const toastContainer = document.getElementById('toastContainer');

export function showToast(message, undoCallback) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  
  if (undoCallback) {
    const undoBtn = document.createElement('button');
    undoBtn.style.marginLeft = '10px';
    undoBtn.style.background = 'transparent';
    undoBtn.style.border = 'none';
    undoBtn.style.color = '#4caf50';
    undoBtn.style.cursor = 'pointer';
    undoBtn.textContent = 'Undo';
    undoBtn.addEventListener('click', () => {
      undoCallback();
      toast.remove();
    });
    toast.appendChild(undoBtn);
  }
  
  toastContainer.appendChild(toast);
  setTimeout(() => {
    if (toast.parentElement) toast.remove();
  }, 3500);
}
