
import { useState, useEffect } from 'react';
import { Employee } from '@/types/appointment';

const EMPLOYEE_ORDER_KEY = 'employee-column-order';

export const useEmployeeOrder = (employees: Employee[]) => {
  const [orderedEmployees, setOrderedEmployees] = useState<Employee[]>([]);

  // Load saved order from localStorage
  const loadSavedOrder = () => {
    try {
      const savedOrder = localStorage.getItem(EMPLOYEE_ORDER_KEY);
      if (savedOrder) {
        const orderIds = JSON.parse(savedOrder) as number[];
        return orderIds;
      }
    } catch (error) {
      console.error('Error loading employee order:', error);
    }
    return null;
  };

  // Save order to localStorage
  const saveOrder = (employeeIds: number[]) => {
    try {
      localStorage.setItem(EMPLOYEE_ORDER_KEY, JSON.stringify(employeeIds));
      console.log('Employee order saved:', employeeIds);
    } catch (error) {
      console.error('Error saving employee order:', error);
    }
  };

  // Apply saved order to employees
  const applyOrder = (employees: Employee[], orderIds: number[]) => {
    const ordered: Employee[] = [];
    const remaining: Employee[] = [...employees];

    // Add employees in saved order
    orderIds.forEach(id => {
      const index = remaining.findIndex(emp => emp.id === id);
      if (index !== -1) {
        ordered.push(remaining[index]);
        remaining.splice(index, 1);
      }
    });

    // Add any new employees that weren't in saved order
    ordered.push(...remaining);

    return ordered;
  };

  // Initialize and update ordered employees when employees change
  useEffect(() => {
    if (employees.length === 0) {
      setOrderedEmployees([]);
      return;
    }

    const savedOrder = loadSavedOrder();
    if (savedOrder && savedOrder.length > 0) {
      const ordered = applyOrder(employees, savedOrder);
      setOrderedEmployees(ordered);
    } else {
      setOrderedEmployees([...employees]);
    }
  }, [employees]);

  // Update order and save to localStorage
  const updateOrder = (newOrderedEmployees: Employee[]) => {
    setOrderedEmployees(newOrderedEmployees);
    const orderIds = newOrderedEmployees.map(emp => emp.id);
    saveOrder(orderIds);
  };

  return {
    orderedEmployees,
    updateOrder
  };
};
