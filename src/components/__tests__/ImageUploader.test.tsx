import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/utils/test-utils';
import ImageUploader from '../ImageUploader';
import { createMockFile } from '@/utils/test-utils';
import { jest, expect, describe, test, beforeEach } from '@jest/globals';
import '@testing-library/jest-dom';

describe('ImageUploader', () => {
  // Mock function for onImageSelect
  const mockOnImageSelect = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders upload interface correctly', () => {
    render(<ImageUploader onImageSelect={mockOnImageSelect} />);
    
    // Check if essential elements are present
    expect(screen.getByText(/Upload your meal photo/i)).toBeInTheDocument();
    expect(screen.getByText(/Drag and drop/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Select Image/i })).toBeInTheDocument();
  });
  
  test('handles valid image upload via input', async () => {
    render(<ImageUploader onImageSelect={mockOnImageSelect} />);
    
    // Create a mock file
    const file = createMockFile();
    const input = screen.getByAcceptingDroppableFiles();
    
    // Mock FileReader for image preview
    const originalFileReader = global.FileReader;
    const mockFileReaderInstance = {
      readAsDataURL: jest.fn(),
      onload: null,
      result: 'data:image/jpeg;base64,mockbase64string'
    };
    
    global.FileReader = jest.fn(() => mockFileReaderInstance) as any;
    
    // Simulate file selection
    fireEvent.change(input, { target: { files: [file] } });
    
    // Trigger the onload event manually
    if (mockFileReaderInstance.onload) {
      mockFileReaderInstance.onload({} as any);
    }
    
    // Check if the onImageSelect was called with correct file
    expect(mockOnImageSelect).toHaveBeenCalledWith(file);
    
    // Restore original FileReader
    global.FileReader = originalFileReader;
  });
  
  test('handles invalid file type', async () => {
    // Mock window.alert
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<ImageUploader onImageSelect={mockOnImageSelect} />);
    
    // Create a mock non-image file
    const file = createMockFile('document.pdf', 'application/pdf');
    const input = screen.getByAcceptingDroppableFiles();
    
    // Simulate file selection
    fireEvent.change(input, { target: { files: [file] } });
    
    // Check if alert was called
    expect(alertMock).toHaveBeenCalledWith('Please select an image file');
    
    // Check that onImageSelect was not called
    expect(mockOnImageSelect).not.toHaveBeenCalled();
    
    // Restore window.alert
    alertMock.mockRestore();
  });
  
  test('handles drag and drop', async () => {
    render(<ImageUploader onImageSelect={mockOnImageSelect} />);
    
    const dropZone = screen.getByText(/Drag and drop/).closest('div')!;
    const file = createMockFile();
    
    // Mock FileReader
    const originalFileReader = global.FileReader;
    const mockFileReaderInstance = {
      readAsDataURL: jest.fn(),
      onload: null,
      result: 'data:image/jpeg;base64,mockbase64string'
    };
    
    global.FileReader = jest.fn(() => mockFileReaderInstance) as any;
    
    // Simulate drag events
    fireEvent.dragOver(dropZone);
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file]
      }
    });
    
    // Trigger the onload event manually
    if (mockFileReaderInstance.onload) {
      mockFileReaderInstance.onload({} as any);
    }
    
    // Check if the onImageSelect was called with correct file
    expect(mockOnImageSelect).toHaveBeenCalledWith(file);
    
    // Restore original FileReader
    global.FileReader = originalFileReader;
  });
  
  test('allows clearing the selected image', async () => {
    render(<ImageUploader onImageSelect={mockOnImageSelect} />);
    
    // Create a mock file
    const file = createMockFile();
    const input = screen.getByAcceptingDroppableFiles();
    
    // Mock FileReader for image preview
    const originalFileReader = global.FileReader;
    const mockFileReaderInstance = {
      readAsDataURL: jest.fn(),
      onload: null,
      result: 'data:image/jpeg;base64,mockbase64string'
    };
    
    global.FileReader = jest.fn(() => mockFileReaderInstance) as any;
    
    // Simulate file selection
    fireEvent.change(input, { target: { files: [file] } });
    
    // Trigger the onload event manually
    if (mockFileReaderInstance.onload) {
      mockFileReaderInstance.onload({} as any);
    }
    
    // Find and click the clear button (X icon)
    const clearButton = await screen.findByRole('button');
    fireEvent.click(clearButton);
    
    // Check that the image was cleared (input reset)
    expect(input.value).toBe('');
    
    // Restore original FileReader
    global.FileReader = originalFileReader;
  });
});

// Add this helper function to find file inputs
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveAttribute(attr: string, value?: any): R;
    }
  }
}

function getByAcceptingDroppableFiles() {
  return document.querySelector('input[type="file"]')!;
}

screen.getByAcceptingDroppableFiles = getByAcceptingDroppableFiles;
