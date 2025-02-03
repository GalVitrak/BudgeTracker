import { message } from "antd";

// טיפוסים לסוגי השגיאות השונות
type ErrorType = {
  code?: string;
  message?: string;
  details?: any;
};

class NotifyService {
  // הגדרת זמן ברירת מחדל להצגת הודעות
  private readonly DEFAULT_DURATION = 4; // seconds

  public success(
    text: string,
    duration?: number
  ): void {
    message.success(
      text,
      duration || this.DEFAULT_DURATION
    );
  }

  public error(err: ErrorType): void {
    const text = this.extractErrorMessage(err);
    message.error(text, this.DEFAULT_DURATION);
  }

  public info(
    text: string,
    duration?: number
  ): void {
    message.info(
      text,
      duration || this.DEFAULT_DURATION
    );
  }

  public warning(
    text: string,
    duration?: number
  ): void {
    message.warning(
      text,
      duration || this.DEFAULT_DURATION
    );
  }

  private extractErrorMessage(
    err: ErrorType
  ): string {
    // אם אין קוד שגיאה, נחזיר את ההודעה המקורית או הודעת ברירת מחדל
    if (!err.code) {
      return (
        err.message || "אירעה שגיאה לא צפויה"
      );
    }

    switch (err.code) {
      // שגיאות אימות משתמש
      case "auth/email-already-in-use":
        return "כתובת האימייל כבר רשומה במערכת";
      case "auth/weak-password":
        return "הסיסמה חייבת להכיל לפחות 6 תווים";
      case "auth/invalid-email":
        return "כתובת האימייל אינה תקינה";
      case "auth/user-not-found":
        return "משתמש לא קיים במערכת";
      case "auth/wrong-password":
        return "סיסמה שגויה, אנא נסה שנית";
      case "auth/email-not-verified":
        return "אנא אמת את כתובת האימייל שלך לפני ההתחברות";
      case "auth/requires-recent-login":
        return "פעולה זו דורשת התחברות מחדש למערכת";
      case "auth/popup-closed-by-user":
        return "החלון נסגר לפני השלמת ההתחברות";
      case "auth/network-request-failed":
        return "בעיית תקשורת, אנא בדוק את חיבור האינטרנט שלך";
      case "auth/too-many-requests":
        return "נעשו יותר מדי ניסיונות התחברות, אנא נסה שוב מאוחר יותר";
      case "auth/user-disabled":
        return "חשבון זה הושבת, אנא פנה לתמיכה";
      case "auth/operation-not-allowed":
        return "פעולה זו אינה מורשית";
      case "auth/invalid-verification-code":
        return "קוד האימות שהוזן שגוי";
      case "auth/invalid-verification-id":
        return "מזהה האימות אינו תקין";

      // שגיאות פונקציות שרת
      case "functions/not-found":
        return "המשאב המבוקש לא נמצא";
      case "functions/already-exists":
        return "הרשומה כבר קיימת במערכת";
      case "functions/failed-precondition":
        return "לא ניתן לבצע את הפעולה, אנא בדוק את הנתונים";
      case "functions/permission-denied":
        return "אין לך הרשאה לבצע פעולה זו";
      case "functions/unauthenticated":
        return "אנא התחבר מחדש למערכת";
      case "functions/invalid-argument":
        return "הנתונים שהוזנו אינם תקינים";
      case "functions/deadline-exceeded":
        return "הפעולה נכשלה עקב זמן תגובה ארוך מדי";
      case "functions/resource-exhausted":
        return "חריגה ממכסת השימוש, אנא נסה שוב מאוחר יותר";

      // שגיאות אחסון
      case "storage/unauthorized":
        return "אין הרשאה לגשת לקובץ זה";
      case "storage/canceled":
        return "הפעולה בוטלה";
      case "storage/unknown":
        return "אירעה שגיאה בגישה לאחסון";
      case "storage/object-not-found":
        return "הקובץ המבוקש לא נמצא";
      case "storage/bucket-not-found":
        return "מיקום האחסון לא נמצא";
      case "storage/quota-exceeded":
        return "חריגה ממכסת האחסון המותרת";

      // שגיאות כלליות
      case "network-error":
        return "בעיית תקשורת, אנא בדוק את חיבור האינטרנט";
      case "server-error":
        return "שגיאת שרת, אנא נסה שוב מאוחר יותר";
      case "validation-error":
        return "אנא בדוק את תקינות הנתונים שהוזנו";
      case "timeout-error":
        return "זמן התגובה ארוך מהצפוי, אנא נסה שוב";

      // ברירת מחדל - החזרת הודעת השגיאה המקורית או הודעה כללית
      default:
        return (
          err.message ||
          "אירעה שגיאה, אנא נסה שוב"
        );
    }
  }
}

const notifyService = new NotifyService();
export default notifyService;
