import React, { useState, useEffect } from 'react';
import { Card, Progress, Button, Modal, Form, Input, DatePicker, Select, message } from 'antd';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, getUserGoalsRef, addDoc, getDocs, query, where, updateDoc, doc } from '../../firebase';
import './styles.css';

const FinancialGoals = () => {
  const [user] = useAuthState(auth);
  const [goals, setGoals] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const goalsRef = getUserGoalsRef(user.uid);
      const q = query(goalsRef);
      const querySnapshot = await getDocs(q);
      const goalsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGoals(goalsData);
    } catch (error) {
      console.error('Error fetching goals:', error);
      message.error('Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async (values) => {
    try {
      setLoading(true);
      const goalsRef = getUserGoalsRef(user.uid);
      await addDoc(goalsRef, {
        ...values,
        userId: user.uid,
        createdAt: new Date(),
        progress: 0,
        status: 'active',
        deadline: values.deadline.toDate() // Convert moment to Date
      });
      message.success('Goal added successfully!');
      form.resetFields();
      setIsModalVisible(false);
      fetchGoals();
    } catch (error) {
      console.error('Error adding goal:', error);
      message.error('Failed to add goal');
    } finally {
      setLoading(false);
    }
  };

  const updateGoalProgress = async (goalId, newProgress) => {
    try {
      setLoading(true);
      const goalRef = doc(getUserGoalsRef(user.uid), goalId);
      await updateDoc(goalRef, {
        progress: newProgress,
        status: newProgress >= 100 ? 'completed' : 'active'
      });
      message.success('Progress updated successfully!');
      fetchGoals();
    } catch (error) {
      console.error('Error updating goal:', error);
      message.error('Failed to update progress');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="goals-container">
      <Card 
        title="Financial Goals" 
        extra={<Button type="primary" onClick={() => setIsModalVisible(true)}>Add Goal</Button>}
        className="goals-card"
        loading={loading}
      >
        {goals.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>No goals set yet. Add your first financial goal!</p>
        ) : (
          goals.map(goal => (
            <div key={goal.id} className="goal-item">
              <div className="goal-header">
                <h3>{goal.title}</h3>
                <span className={`goal-status ${goal.status}`}>{goal.status}</span>
              </div>
              <Progress 
                percent={goal.progress} 
                status={goal.progress >= 100 ? 'success' : 'active'}
                strokeColor={{
                  '0%': '#48BB78',
                  '100%': '#2D3748',
                }}
              />
              <div className="goal-details">
                <p>Target: ₹{goal.targetAmount}</p>
                <p>Deadline: {new Date(goal.deadline).toLocaleDateString()}</p>
              </div>
              <div className="goal-actions">
                <Button 
                  type="primary" 
                  onClick={() => updateGoalProgress(goal.id, Math.min(goal.progress + 10, 100))}
                  disabled={goal.progress >= 100}
                  loading={loading}
                >
                  Update Progress
                </Button>
              </div>
            </div>
          ))
        )}
      </Card>

      <Modal
        title="Add New Financial Goal"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form 
          form={form} 
          onFinish={handleAddGoal} 
          layout="vertical"
          initialValues={{ category: 'savings' }}
        >
          <Form.Item
            name="title"
            label="Goal Title"
            rules={[{ required: true, message: 'Please input the goal title!' }]}
          >
            <Input placeholder="e.g., Save for Vacation" />
          </Form.Item>
          <Form.Item
            name="targetAmount"
            label="Target Amount"
            rules={[{ required: true, message: 'Please input the target amount!' }]}
          >
            <Input type="number" placeholder="Enter amount in ₹" />
          </Form.Item>
          <Form.Item
            name="deadline"
            label="Target Date"
            rules={[{ required: true, message: 'Please select the target date!' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select a category!' }]}
          >
            <Select placeholder="Select category">
              <Select.Option value="savings">Savings</Select.Option>
              <Select.Option value="investment">Investment</Select.Option>
              <Select.Option value="debt">Debt Payment</Select.Option>
              <Select.Option value="purchase">Major Purchase</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Add Goal
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FinancialGoals; 