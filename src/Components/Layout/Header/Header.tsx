import "./Header.css";
import { useState } from "react";
import {
  DollarOutlined,
  HomeOutlined,
  SettingOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Menu } from "antd";
import { useNavigate } from "react-router-dom";
import {
  authStore,
  AuthActionType,
} from "../../../Redux/AuthState";
import { auth } from "../../../../firebase-config";
import notifyService from "../../../Services/NotifyService";

function Header(): JSX.Element {
  const navigate = useNavigate();

  type MenuItem =
    Required<MenuProps>["items"][number];

  const [current, setCurrent] = useState(
    window.location.pathname.slice(1)
  );

  const menu: MenuItem[] = [
    {
      label: "בית",
      key: "home",
      icon: (
        <HomeOutlined
          style={{ fontSize: "18px" }}
        />
      ),
    },
    {
      label: "התחברות",
      key: "login",
      icon: (
        <LoginOutlined
          style={{ fontSize: "18px" }}
        />
      ),
    },
  ];

  const loggedInMenu: MenuItem[] = [
    {
      label: "דאשבורד",
      key: "dashboard",
      icon: (
        <HomeOutlined
          style={{ fontSize: "18px" }}
        />
      ),
    },
    {
      label: "טבלת הוצאות",
      key: "spending-table",
      icon: (
        <DollarOutlined
          style={{ fontSize: "18px" }}
        />
      ),
    },
    {
      label: "דוחות וניתוח",
      key: "budget",
      icon: (
        <DollarOutlined
          style={{ fontSize: "18px" }}
        />
      ),
    },
    {
      label: "הגדרות",
      key: "SubMenu",
      icon: (
        <SettingOutlined
          style={{ fontSize: "18px" }}
        />
      ),
      children: [
        {
          label: "משתמש",
          key: "user-settings",
        },
        {
          label: "קטגוריות",
          key: "categories",
        },
      ],
    },
    {
      label: "התנתק",
      key: "logout",
      icon: (
        <LoginOutlined
          style={{ fontSize: "18px" }}
        />
      ),
    },
  ];

  const onClick: MenuProps["onClick"] = (e) => {
    if (e.key === "logout") {
      authStore.dispatch({
        type: AuthActionType.Logout,
      });
      navigate("/home");
      return;
    }
    navigate("/" + e.key);
    setCurrent(e.key);
  };

  return (
    <div className="Header">
      {authStore.getState().user ? (
        <Menu
          onClick={onClick}
          selectedKeys={[current]}
          items={loggedInMenu}
          mode="horizontal"
          style={{
            background: "transparent",
            borderBottom: "1px solid #e8e8e8",
            boxShadow:
              "0 2px 8px rgba(0,0,0,0.06)",
            padding: "0 20px",
            fontSize: "16px",
          }}
        />
      ) : (
        <Menu
          onClick={onClick}
          selectedKeys={[current]}
          items={menu}
          mode="horizontal"
          style={{
            background: "transparent",
            borderBottom: "1px solid #e8e8e8",
            boxShadow:
              "0 2px 8px rgba(0,0,0,0.06)",
            padding: "0 20px",
            fontSize: "16px",
          }}
        />
      )}
    </div>
  );
}

export default Header;
