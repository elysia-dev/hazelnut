import Sweetalert2 from 'sweetalert2'

const Swal = Sweetalert2.mixin({
  customClass: {
    popup: 'modal-content',
    confirmButton: 'modal-btn-success',
    actions: 'modal-actions',
    title: 'modal-title',
  },
})

export default Swal;