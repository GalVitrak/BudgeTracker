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

  const [current, setCurrent] = useState(window.location.pathname.slice(1));

  const menu: MenuItem[] = [
    {
      label: "בית",
      key: "home",
      icon: <HomeOutlined />,
    },
    {
      label: "התחברות",
      key: "login",
      icon: <LoginOutlined />,
    },
  ];

  const loggedInMenu: MenuItem[] = [
    {
      label: "בית",
      key: "home",
      icon: <HomeOutlined />,
    },
    {
      label: "טבלת הוצאות",
      key: "spending-table",
      icon: <DollarOutlined />,
    },
    {
      label: "הגדרות",
      key: "SubMenu",
      icon: <SettingOutlined />,
      children: [
        {
          label: "משתמש",
          key: "user-settings",
        },

        { label: "קטגוריות", key: "categories" },
      ],
    },
    {
      label: "התנתק",
      key: "logout",
      icon: <LoginOutlined />,
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
        <>
          <Menu
            onClick={onClick}
            selectedKeys={[current]}
            items={loggedInMenu}
            mode="horizontal"
          />
        </>
      ) : (
        <>
          <Menu
            onClick={onClick}
            selectedKeys={[current]}
            items={menu}
            mode="horizontal"
          />
        </>
      )}
    </div>
  );
}

export default Header;
