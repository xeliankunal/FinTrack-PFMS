import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Input, Select, message, Table, Space, Popconfirm } from 'antd';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, collection, addDoc, getDocs, deleteDoc, doc, query, where } from '../../firebase';

const CategoryManager = () => {
  const [user] = useAuthState(auth);
  const [categories, setCategories] = useState({ income: [], expense: [] });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const categoriesRef = collection(db, `users/${user.uid}/categories`);
      const q = query(categoriesRef);
      const querySnapshot = await getDocs(q);
      
      const categoriesData = {
        income: [],
        expense: []
      };

      querySnapshot.forEach(doc => {
        const category = { id: doc.id, ...doc.data() };
        if (category.type === 'income') {
          categoriesData.income.push(category);
        } else {
          categoriesData.expense.push(category);
        }
      });

      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      message.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (values) => {
    try {
      setLoading(true);
      const categoriesRef = collection(db, `users/${user.uid}/categories`);
      await addDoc(categoriesRef, {
        ...values,
        userId: user.uid,
        createdAt: new Date()
      });
      message.success('Category added successfully!');
      form.resetFields();
      setIsModalVisible(false);
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      message.error('Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      setLoading(true);
      const categoryRef = doc(db, `users/${user.uid}/categories`, categoryId);
      await deleteDoc(categoryRef);
      message.success('Category deleted successfully!');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      message.error('Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Are you sure you want to delete this category?"
            onConfirm={() => handleDeleteCategory(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="category-manager">
      <Card 
        title="Manage Categories" 
        extra={<Button type="primary" onClick={() => setIsModalVisible(true)}>Add Category</Button>}
        className="category-card"
        loading={loading}
      >
        <div className="category-tables">
          <div className="category-table">
            <h3>Income Categories</h3>
            <Table 
              dataSource={categories.income} 
              columns={columns} 
              rowKey="id"
              pagination={false}
            />
          </div>
          <div className="category-table">
            <h3>Expense Categories</h3>
            <Table 
              dataSource={categories.expense} 
              columns={columns} 
              rowKey="id"
              pagination={false}
            />
          </div>
        </div>
      </Card>

      <Modal
        title="Add New Category"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form 
          form={form} 
          onFinish={handleAddCategory} 
          layout="vertical"
        >
          <Form.Item
            name="type"
            label="Category Type"
            rules={[{ required: true, message: 'Please select category type!' }]}
          >
            <Select placeholder="Select type">
              <Select.Option value="income">Income</Select.Option>
              <Select.Option value="expense">Expense</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="name"
            label="Category Name"
            rules={[{ required: true, message: 'Please input category name!' }]}
          >
            <Input placeholder="e.g., Salary, Groceries" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea placeholder="Optional description" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Add Category
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryManager; 