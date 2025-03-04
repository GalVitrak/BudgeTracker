import "./CategoriesManagement.css";
import { useEffect, useState } from "react";
import { Card, Modal } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  collection,
  query,
  where,
  or,
} from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "../../../../firebase-config";
import { authStore } from "../../../Redux/AuthState";
import CategoryModel from "../../../Models/CategoryModel";
import { getCategoryEmoji } from "../../../Utils/CategoryUtils";
import notifyService from "../../../Services/NotifyService";
import categoryService from "../../../Services/CategoryService";

export function CategoriesManagement(): JSX.Element {
  const [categories, setCategories] = useState<
    CategoryModel[]
  >([]);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryModel | null>(null);
  const [
    selectedSubCategory,
    setSelectedSubCategory,
  ] = useState<string>("");
  const [
    isEditModalVisible,
    setIsEditModalVisible,
  ] = useState(false);
  const [
    isDeleteModalVisible,
    setIsDeleteModalVisible,
  ] = useState(false);
  const [
    isDeleteSubCategoryModalVisible,
    setIsDeleteSubCategoryModalVisible,
  ] = useState(false);
  const [
    isAddSubcategoryModalVisible,
    setIsAddSubcategoryModalVisible,
  ] = useState(false);

  const [newCategoryName, setNewCategoryName] =
    useState("");
  const [
    newSubcategoryName,
    setNewSubcategoryName,
  ] = useState("");

  const uid = authStore.getState().user?.uid;

  // Firebase Query for both user categories and default categories
  const categoriesQuery = query(
    collection(db, "categories"),
    or(
      where("uid", "array-contains", uid),
      where("uid", "array-contains", "allUsers")
    )
  );

  const [snapshot] = useCollection(
    categoriesQuery
  );

  useEffect(() => {
    if (snapshot) {
      const loadedCategories = snapshot.docs.map(
        (doc) => {
          const data = doc.data();
          return new CategoryModel(
            data.uid,
            data.name,
            data.subCategories,
            doc.id,
            data.isDefault
          );
        }
      );
      setCategories(loadedCategories);
    }
  }, [snapshot]);

  const handleEditCategory = (
    category: CategoryModel
  ): void => {
    if (category.isDefault) {
      notifyService.warning(
        "לא ניתן לערוך קטגוריות ברירת מחדל"
      );
      return;
    }
    setSelectedCategory(category);
    setNewCategoryName(category.name);
    setIsEditModalVisible(true);
  };

  const handleDeleteCategory = (
    category: CategoryModel
  ) => {
    if (category.isDefault) {
      notifyService.warning(
        "לא ניתן למחוק קטגוריות ברירת מחדל"
      );
      return;
    }
    setSelectedCategory(category);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteSubCategory = (
    category: CategoryModel,
    subCategoryName: string
  ) => {
    const subCategory =
      category.subCategories.find(
        (sub) => sub.name === subCategoryName
      );
    if (subCategory?.isDefault) {
      notifyService.warning(
        "לא ניתן למחוק תת-קטגוריות ברירת מחדל"
      );
      return;
    }
    setSelectedCategory(category);
    setSelectedSubCategory(subCategoryName);
    setIsDeleteSubCategoryModalVisible(true);
  };

  const handleAddSubcategory = (
    category: CategoryModel
  ) => {
    setSelectedCategory(category);
    setNewSubcategoryName("");
    setIsAddSubcategoryModalVisible(true);
  };

  const handleEditSubmit = async () => {
    if (
      !selectedCategory ||
      !newCategoryName.trim() ||
      !uid
    )
      return;

    try {
      await categoryService.updateCategory(
        selectedCategory,
        newCategoryName.trim()
      );
      setIsEditModalVisible(false);
 
    } catch (error) {
      notifyService.error({
        message: "שגיאה בעדכון הקטגוריה",
      });
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedCategory || !uid) return;

    try {
      await categoryService.deleteCategory(
        selectedCategory.id!,
        uid
      );
      setIsDeleteModalVisible(false);
    
    } catch (error) {
      notifyService.error({
        message: "שגיאה במחיקת הקטגוריה",
      });
    }
  };

  const handleDeleteSubCategorySubmit =
    async () => {
      if (
        !selectedCategory ||
        !selectedSubCategory ||
        !uid
      )
        return;

      try {
        await categoryService.deleteSubCategory(
          selectedCategory.id!,
          selectedSubCategory,
          uid
        );
        setIsDeleteSubCategoryModalVisible(false);
     
      } catch (error) {
        notifyService.error({
          message: "שגיאה במחיקת תת-הקטגוריה",
        });
      }
    };

  const handleAddSubcategorySubmit = async () => {
    if (
      !selectedCategory?.id ||
      !newSubcategoryName.trim() ||
      !uid
    )
      return;

    try {
      await categoryService.addSubCategory(
        selectedCategory.id,
        newSubcategoryName.trim(),
        uid
      );
      setIsAddSubcategoryModalVisible(false);
      setNewSubcategoryName("");
  
    } catch (error) {
      console.error(
        "Error adding subcategory:",
        error
      );
      notifyService.error({
        message: "שגיאה בהוספת תת-הקטגוריה",
        details: error,
      });
    }
  };

  const filterSubCategories = (
    category: CategoryModel
  ) => {
    return category.subCategories.filter(
      (subCategory) =>
        subCategory.uid?.includes(uid || "") ||
        subCategory.uid?.includes("allUsers") ||
        category.uid?.includes("allUsers")
    );
  };

  return (
    <div className="CategoriesManagement">
      <div className="categories-container">
        <div className="categories-header">
          <h1>ניהול קטגוריות והוצאות</h1>
          <p>
            נהל את הקטגוריות ותתי-הקטגוריות שלך
          </p>
        </div>

        <div className="categories-grid">
          {categories.map((category) => (
            <Card
              key={category.id}
              title={
                <div className="category-title">
                  <h3>
                    {getCategoryEmoji(
                      category.name
                    )}{" "}
                    {category.name}
                  </h3>
                  {category.isDefault ? (
                    <div className="badge-actions">
                      <PlusOutlined
                        className="action-icon add"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddSubcategory(
                            category
                          );
                        }}
                      />
                      <span className="default-category-badge">
                        ברירת מחדל
                      </span>
                    </div>
                  ) : (
                    <div className="badge-actions">
                      <EditOutlined
                        className="action-icon edit"
                        onClick={() =>
                          handleEditCategory(
                            category
                          )
                        }
                      />
                      <DeleteOutlined
                        className="action-icon delete"
                        onClick={() =>
                          handleDeleteCategory(
                            category
                          )
                        }
                      />
                      <PlusOutlined
                        className="action-icon add"
                        onClick={() =>
                          handleAddSubcategory(
                            category
                          )
                        }
                      />
                    </div>
                  )}
                </div>
              }
              className={`category-card ${
                category.isDefault
                  ? "default-category"
                  : ""
              }`}
            >
              <div className="subcategories-list">
                {filterSubCategories(
                  category
                ).map((subCategory) => (
                  <div
                    key={subCategory.name}
                    className="subcategory-item"
                  >
                    <div className="subcategory-container">
                      <span>
                        {subCategory.name}
                      </span>
                      {subCategory.isDefault ? (
                        <div className="subcategory-actions">
                          <span className="default-subcategory-badge">
                            ברירת מחדל
                          </span>
                        </div>
                      ) : (
                        <div className="subcategory-actions">
                          <DeleteOutlined
                            className="delete-subcategory-icon"
                            onClick={() =>
                              handleDeleteSubCategory(
                                category,
                                subCategory.name
                              )
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Edit Category Modal */}
        <Modal
          title="עריכת קטגוריה"
          open={isEditModalVisible}
          onOk={handleEditSubmit}
          onCancel={() =>
            setIsEditModalVisible(false)
          }
          okText="שמור"
          cancelText="בטל"
          centered
        >
          <div className="input-group">
            <input
              type="text"
              className="input"
              value={newCategoryName}
              onChange={(e) =>
                setNewCategoryName(e.target.value)
              }
              required
            />
            <label className="label">
              שם הקטגוריה
            </label>
          </div>
        </Modal>

        {/* Delete Category Modal */}
        <Modal
          title="מחיקת קטגוריה"
          open={isDeleteModalVisible}
          onOk={handleDeleteSubmit}
          onCancel={() =>
            setIsDeleteModalVisible(false)
          }
          okText="מחק"
          cancelText="בטל"
          centered
          okButtonProps={{ danger: true }}
        >
          <p>
            האם אתה בטוח שברצונך למחוק את הקטגוריה{" "}
            {selectedCategory?.name}?
          </p>
          <p>
            פעולה זו תמחק גם את כל תתי-הקטגוריות
            המשויכות.
          </p>
        </Modal>

        {/* Delete Subcategory Modal */}
        <Modal
          title="מחיקת תת-קטגוריה"
          open={isDeleteSubCategoryModalVisible}
          onOk={handleDeleteSubCategorySubmit}
          onCancel={() =>
            setIsDeleteSubCategoryModalVisible(
              false
            )
          }
          okText="מחק"
          cancelText="בטל"
          centered
          okButtonProps={{ danger: true }}
        >
          <p>
            האם אתה בטוח שברצונך למחוק את
            תת-הקטגוריה {selectedSubCategory}?
          </p>
        </Modal>

        {/* Add Subcategory Modal */}
        <Modal
          title="הוספת תת-קטגוריה"
          open={isAddSubcategoryModalVisible}
          onOk={handleAddSubcategorySubmit}
          onCancel={() =>
            setIsAddSubcategoryModalVisible(false)
          }
          okText="הוסף"
          cancelText="בטל"
          centered
        >
          <div className="input-group">
            <input
              type="text"
              className="input"
              value={newSubcategoryName}
              onChange={(e) =>
                setNewSubcategoryName(
                  e.target.value
                )
              }
              required
            />
            <label className="label">
              שם תת-הקטגוריה
            </label>
          </div>
        </Modal>
      </div>
    </div>
  );
}
