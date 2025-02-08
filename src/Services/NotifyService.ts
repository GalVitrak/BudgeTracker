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
      // Firebase Auth - שגיאות אימות משתמש
      case "auth/email-already-in-use":
        return "כתובת האימייל כבר רשומה במערכת";
      case "auth/weak-password":
        return "הסיסמה חלשה מדי - נדרשים לפחות 6 תווים";
      case "auth/invalid-email":
        return "כתובת האימייל שהוזנה אינה תקינה";
      case "auth/user-not-found":
        return "לא נמצא משתמש המשויך לאימייל זה";
      case "auth/wrong-password":
        return "הסיסמה שהוזנה שגויה";
      case "auth/email-not-verified":
        return "יש לאמת את כתובת האימייל לפני ההתחברות";
      case "auth/requires-recent-login":
        return "פעולה זו דורשת התחברות מחדש מטעמי אבטחה";
      case "auth/popup-closed-by-user":
        return "חלון ההתחברות נסגר לפני השלמת התהליך";
      case "auth/network-request-failed":
        return "נכשל ניסיון ההתחברות - בעיית תקשורת";
      case "auth/too-many-requests":
        return "נחסמה הגישה זמנית עקב ניסיונות רבים מדי";
      case "auth/user-disabled":
        return "החשבון הושבת - צור קשר עם התמיכה";
      case "auth/operation-not-allowed":
        return "פעולה זו אינה מורשית כרגע";
      case "auth/invalid-verification-code":
        return "קוד האימות שהוזן אינו תקין";
      case "auth/invalid-verification-id":
        return "בקשת האימות אינה תקינה";
      case "auth/missing-verification-code":
        return "לא הוזן קוד אימות";
      case "auth/invalid-credential":
        return "פרטי הההתחברות אינם תקינים";
      case "auth/invalid-continue-uri":
        return "כתובת ההפניה אינה תקינה";
      case "auth/unauthorized-continue-uri":
        return "כתובת ההפניה אינה מורשית";
      case "auth/missing-continue-uri":
        return "חסרה כתובת הפניה";
      case "auth/missing-phone-number":
        return "לא הוזן מספר טלפון";
      case "auth/invalid-phone-number":
        return "מספר הטלפון שהוזן אינו תקין";
      case "auth/quota-exceeded":
        return "חריגה ממכסת הבקשות המותרת";
      case "auth/rejected-credential":
        return "פרטי ההזדהות נדחו";
      case "auth/user-cancelled":
        return "המשתמש ביטל את הפעולה";
      case "auth/user-token-expired":
        return "פג תוקף החיבור - יש להתחבר מחדש";
      case "auth/web-storage-unsupported":
        return "הדפדפן אינו תומך באחסון מקומי";
      case "auth/invalid-api-key":
        return "מפתח ה-API אינו תקין";
      case "auth/app-deleted":
        return "האפליקציה נמחקה מהשרת";
      case "auth/user-mismatch":
        return "אי התאמה בפרטי המשתמש";
      case "auth/credential-already-in-use":
        return "פרטי ההזדהות כבר בשימוש";
      case "auth/operation-not-supported-in-this-environment":
        return "הפעולה אינה נתמכת בסביבה זו";
      case "auth/timeout":
        return "פג הזמן המוקצב לפעולה";

      // Firebase Firestore - שגיאות בסיס נתונים
      case "firestore/cancelled":
        return "הפעולה בוטלה";
      case "firestore/unknown":
        return "שגיאה לא ידועה בבסיס הנתונים";
      case "firestore/invalid-argument":
        return "הפרמטרים שהועברו אינם תקינים";
      case "firestore/deadline-exceeded":
        return "פג הזמן המוקצב לפעולה";
      case "firestore/not-found":
        return "המסמך המבוקש לא נמצא";
      case "firestore/already-exists":
        return "המסמך כבר קיים במערכת";
      case "firestore/permission-denied":
        return "אין הרשאות מתאימות לביצוע הפעולה";
      case "firestore/resource-exhausted":
        return "חריגה ממכסת המשאבים המותרת";
      case "firestore/failed-precondition":
        return "התנאים המקדימים לפעולה לא התקיימו";
      case "firestore/aborted":
        return "הפעולה הופסקה";
      case "firestore/out-of-range":
        return "הערך שהוזן חורג מהטווח המותר";
      case "firestore/unimplemented":
        return "הפעולה אינה נתמכת";
      case "firestore/internal":
        return "שגיאה פנימית בשרת";
      case "firestore/unavailable":
        return "השירות אינו זמין כרגע";
      case "firestore/data-loss":
        return "אובדן נתונים קריטי";
      case "firestore/unauthenticated":
        return "המשתמש אינו מחובר";

      // Firebase Storage - שגיאות אחסון
      case "storage/unknown":
        return "שגיאה לא ידועה באחסון";
      case "storage/object-not-found":
        return "הקובץ המבוקש לא נמצא";
      case "storage/bucket-not-found":
        return "מיקום האחסון לא נמצא";
      case "storage/project-not-found":
        return "הפרויקט לא נמצא";
      case "storage/quota-exceeded":
        return "חריגה ממכסת האחסון המותרת";
      case "storage/unauthenticated":
        return "יש להתחבר כדי לבצע פעולה זו";
      case "storage/unauthorized":
        return "אין הרשאה לבצע פעולה זו";
      case "storage/retry-limit-exceeded":
        return "חריגה ממספר הניסיונות המותר";
      case "storage/invalid-checksum":
        return "הקובץ שהועלה פגום";
      case "storage/canceled":
        return "הפעולה בוטלה";
      case "storage/invalid-event-name":
        return "שם האירוע אינו תקין";
      case "storage/invalid-url":
        return "כתובת ה-URL אינה תקינה";
      case "storage/invalid-argument":
        return "הפרמטרים שהועברו אינם תקינים";
      case "storage/no-default-bucket":
        return "לא הוגדר מיקום אחסון ברירת מחדל";
      case "storage/cannot-slice-blob":
        return "לא ניתן לחלק את הקובץ";
      case "storage/server-file-wrong-size":
        return "גודל הקובץ בשרת שונה מהמצופה";

      // שגיאות כלליות
      case "network-error":
        return "בעיית תקשורת - בדוק את חיבור האינטרנט";
      case "server-error":
        return "שגיאת שרת - נסה שוב מאוחר יותר";
      case "validation-error":
        return "הנתונים שהוזנו אינם תקינים";
      case "timeout-error":
        return "פג הזמן המוקצב לפעולה";
      case "unauthorized":
        return "אין הרשאה לבצע פעולה זו";
      case "forbidden":
        return "הגישה נדחתה";
      case "not-found":
        return "המשאב המבוקש לא נמצא";
      case "conflict":
        return "התנגשות נתונים - הפעולה לא הושלמה";
      case "bad-request":
        return "בקשה לא תקינה";

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
