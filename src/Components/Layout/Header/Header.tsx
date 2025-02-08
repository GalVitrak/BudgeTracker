import "./Header.css";
import { useEffect, useState } from "react";
import {
  TableOutlined,
  LogoutOutlined,
  MenuOutlined,
  CloseOutlined,
  PieChartOutlined,
  SettingOutlined,
  LoginOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Menu } from "antd";
import { useNavigate } from "react-router-dom";
import {
  authStore,
  AuthActionType,
} from "../../../Redux/AuthState";
import notifyService from "../../../Services/NotifyService";

function Header(): JSX.Element {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);
  const [isMobile, setIsMobile] = useState(
    window.innerWidth <= 768
  );

  type MenuItem =
    Required<MenuProps>["items"][number];

  const [current, setCurrent] = useState(
    window.location.pathname.slice(1)
  );

  useEffect(() => {
    setCurrent(window.location.pathname.slice(1));
  }, [window.location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener(
      "resize",
      handleResize
    );
    return () =>
      window.removeEventListener(
        "resize",
        handleResize
      );
  }, []);

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
        <TableOutlined
          style={{ fontSize: "18px" }}
        />
      ),
    },
    {
      label: "הגדרות תקציב",
      key: "budget-settings",
      icon: (
        <SettingOutlined
          style={{ fontSize: "18px" }}
        />
      ),
    },
    {
      label: "דוחות וניתוח",
      key: "budget-graph",
      icon: (
        <PieChartOutlined
          style={{ fontSize: "18px" }}
        />
      ),
    },
    {
      label: "התנתק",
      key: "logout",
      icon: (
        <LogoutOutlined
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
      notifyService.success("התנתקת בהצלחה");
      navigate("/home");
      return;
    }
    navigate("/" + e.key);
    setCurrent(e.key);
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="Header">
      {isMobile && (
        <button
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? (
            <CloseOutlined
              style={{ fontSize: "24px" }}
            />
          ) : (
            <MenuOutlined
              style={{ fontSize: "24px" }}
            />
          )}
        </button>
      )}
      <div
        className={`menu-container ${
          isMobileMenuOpen
            ? "mobile-menu-open"
            : ""
        }`}
      >
        {authStore.getState().user ? (
          <Menu
            onClick={onClick}
            selectedKeys={[current]}
            items={loggedInMenu}
            mode={
              isMobile ? "vertical" : "horizontal"
            }
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
            mode={
              isMobile ? "vertical" : "horizontal"
            }
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
    </div>
  );
}

export default Header;
