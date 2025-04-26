import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Input, Select, DatePicker, message } from 'antd';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, collection, addDoc, getDocs, query, where } from '../../firebase';
import './styles.css';

const AddTransaction = () => {
  const [user] = useAuthState(auth);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState({ income: [], expense: [] });

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);

  const fetchCategories = async () => {
    try {
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
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const transactionsRef = collection(db, `users/${user.uid}/transactions`);
      await addDoc(transactionsRef, {
        ...values,
        userId: user.uid,
        date: values.date.toDate(),
        createdAt: new Date()
      });
      message.success('Transaction added successfully!');
      form.resetFields();
    } catch (error) {
      console.error('Error adding transaction:', error);
      message.error('Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-transaction">
      <Card title="Add Transaction" className="transaction-card">
        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          initialValues={{ type: 'expense' }}
        >
          <Form.Item
            name="type"
            label="Transaction Type"
            rules={[{ required: true, message: 'Please select transaction type!' }]}
          >
            <Select>
              <Select.Option value="income">Income</Select.Option>
              <Select.Option value="expense">Expense</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="name"
            label="Transaction Name"
            rules={[{ required: true, message: 'Please input transaction name!' }]}
          >
            <Input placeholder="e.g., Salary, Groceries" />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: 'Please input amount!' }]}
          >
            <Input type="number" placeholder="Enter amount" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select category!' }]}
          >
            <Select placeholder="Select category">
              {form.getFieldValue('type') === 'income' ? (
                categories.income.map(category => (
                  <Select.Option key={category.id} value={category.name}>
                    {category.name}
                  </Select.Option>
                ))
              ) : (
                categories.expense.map(category => (
                  <Select.Option key={category.id} value={category.name}>
                    {category.name}
                  </Select.Option>
                ))
              )}
            </Select>
          </Form.Item>

          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: 'Please select date!' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea placeholder="Optional description" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Add Transaction
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddTransaction; 