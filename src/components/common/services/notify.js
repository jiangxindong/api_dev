
import { Notification } from 'element-ui';
export default {
  success(message, title = "提示信息", position = "bottom-right") {
    Notification({
      title,
      message,
      type: 'success',
      position
    });
  },
  warning(message, title = "提示信息", position = "bottom-right") {
    Notification({
      title,
      message,
      type: 'warning',
      position
    });
  },
  info(message, title = "提示信息", position = "bottom-right") {
    Notification({
      title,
      message,
      type: 'info',
      position
    });
  },
  error(message, title = "提示信息", position = "bottom-right") {
    Notification({
      title,
      message,
      type: 'error',
      position
    });
  }
}