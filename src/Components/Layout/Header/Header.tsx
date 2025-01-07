import "./Header.css";
import { useState } from "react";
import {
  DollarOutlined,
  HomeOutlined,
  SettingOutlined,
  UserAddOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Menu } from "antd";
import { useNavigate } from "react-router-dom";

function Header(): JSX.Element {
  const navigate = useNavigate();

  type MenuItem =
    Required<MenuProps>["items"][number];

  const [current, setCurrent] = useState("home");
  const [loggedIn, setLoggedIn] = useState(false);

  const menu: MenuItem[] = [
    {
      label: "בית",
      key: "home",
      icon: <HomeOutlined />,
    },
    {
      label: "הרשמה",
      key: "register",
      icon: <UserAddOutlined />,
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
      label: "רשימת הוצאות",
      key: "list",
      icon: <DollarOutlined />,
    },
    {
      label: "הגדרות",
      key: "SubMenu",
      icon: <SettingOutlined />,
      children: [
        {
          label: "משתמש",
          key: "setting:1",
        },

        { label: "קטגוריות", key: "setting:2" },
        {
          label: "התנתק",
          key: "setting:3",
        },
      ],
    },
  ];

  const onClick: MenuProps["onClick"] = (e) => {
    console.log("click ", e);
    navigate("/" + e.key);
    setCurrent(e.key);
  };

  return (
    <div className="Header">
      {loggedIn ? (
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
