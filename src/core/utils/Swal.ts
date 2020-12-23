import Sweetalert2 from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const Swal = Sweetalert2.mixin({
  customClass: {
    popup: 'modal-content',
    confirmButton: 'modal-btn-success',
    actions: 'modal-actions',
    title: 'modal-title',
  },
  allowOutsideClick: false,
})

export const SwalWithReact = withReactContent(Swal);

export default Swal;