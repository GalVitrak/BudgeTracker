import UserModel from "../../../Models/UserModel";
import "./Register.css";
import { useForm } from "react-hook-form";

function Register(): JSX.Element {
  const { register, handleSubmit } =
    useForm<UserModel>();

  async function send(user: UserModel) {
    console.log(user);
  }

  return (
    <div className="Register">
      <form onSubmit={handleSubmit(send)}>
        <div className="input-group">
          <input
            className="input"
            required
            autoComplete="off"
            type="text"
            {...register("nickname")}
          />
          <label
            className="label"
            htmlFor="nickname"
          >
            שם משתמש
          </label>
        </div>
        <div className="input-group">
          <input
            className="input"
            required
            autoComplete="off"
            type="text"
            {...register("email")}
          />
          <label
            className="label"
            htmlFor="email"
          >
            מייל
          </label>
        </div>

        <div className="input-group">
          <input
            className="input"
            required
            type="password"
            {...register("password")}
          />
          <label
            className="label"
            htmlFor="password"
          >
            סיסמה
          </label>
        </div>
        <button>הירשם</button>
      </form>

      {/* <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{
          display: "flex",
          flexDirection: "column",

          width: "50%",
        }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item<FieldType>
          label="שם משתמש"
          name="username"
          rules={[
            {
              required: true,
              message: "אנא הכנס שם משתמש",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item<FieldType>
          label="מייל"
          name="email"
          rules={[
            {
              required: true,
              message:
                "אנא הכנס כתובת מייל תקינה",
              pattern:
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item<FieldType>
          label="סיסמה"
          name="password"
          rules={[
            {
              required: true,
              message: "אנא הכנס סיסמה",
            },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item label={null}>
          <Button
            type="primary"
            htmlType="submit"
          >
            הירשם
          </Button>
        </Form.Item>
      </Form> */}
    </div>
  );
}

export default Register;
