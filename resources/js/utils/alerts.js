
import Swal from 'sweetalert2';

const baseConfig = {
    width: '340px',
    padding: '16px 18px',
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#64748b',
    reverseButtons: true,
    buttonsStyling: true,
    customClass: {
        popup: 'app-swal-popup',
        title: 'app-swal-title',
        htmlContainer: 'app-swal-text',
        icon: 'app-swal-icon',
        confirmButton: 'app-swal-confirm',
        cancelButton: 'app-swal-cancel',
    },
};

export function showSuccess(title, text = '') {
    return Swal.fire({
        ...baseConfig,
        icon: 'success',
        title,
        text,
        timer: 2200,
        showConfirmButton: false,
    });
}

export function showError(title, text = '') {
    return Swal.fire({
        ...baseConfig,
        icon: 'error',
        title,
        text,
        confirmButtonText: 'Mengerti',
    });
}

export function showInfo(title, text = '') {
    return Swal.fire({
        ...baseConfig,
        icon: 'info',
        title,
        text,
        confirmButtonText: 'Mengerti',
    });
}

export async function confirmAction({
    title = 'Apakah Anda yakin?',
    text = 'Tindakan ini tidak dapat dibatalkan.',
    confirmText = 'Ya, lanjutkan',
    cancelText = 'Batal',
    icon = 'warning',
} = {}) {
    const result = await Swal.fire({
        ...baseConfig,
        icon,
        title,
        text,
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        focusCancel: true,
    });

    return result.isConfirmed;
}

export function showLoading(title = 'Memproses...') {
    Swal.fire({
        ...baseConfig,
        title,
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
        showConfirmButton: false,
    });
}

export function closeLoading() {
    Swal.close();
}

export function showToast(title, icon = 'success') {
    return Swal.fire({
        toast: true,
        position: 'top-end',
        icon,
        title,
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
    });
}
