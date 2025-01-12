import { message } from "antd";

class NotifyService {
  public success(text: string): void {
    message.success(text);
  }

  public error(err: any): void {
    const text = this.extractErrorMessage(err);
    message.error(text);
  }

  public info(text: string): void {
    message.info(text);
  }

  private extractErrorMessage(err: any): string {
    switch (err.code) {
      case "auth/email-already-in-use":
        return "משתמש כבר קיים";
      case "auth/weak-password":
        return "סיסמה חלשה מדי";
      case "auth/invalid-email":
        return "דוא''ל לא תקין";
      case "functions/not-found":
        return "לא נמצא משתמש";
      case "auth/wrong-password":
        return "סיסמה שגויה";
      case "auth/too-many-requests":
        return "Too many requests, please try again later";
      case "auth/argument-error":
        return "Argument error, please try again";
      case "auth/missing-argument":
        return "Missing argument, please try again";
      case "auth/internal-error":
        return "Internal error, please try again";
      case "auth/email-not-verified":
        return "אנא אמת את כתובת הדוא''ל שלך";
      default:
        return err.message;
    }
  }
}

const notifyService = new NotifyService();

export default notifyService;
