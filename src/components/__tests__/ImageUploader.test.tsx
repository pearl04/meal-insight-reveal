import React from 'react';
import { render, screen, fireEvent } from '@/utils/test-utils';
import ImageUploader from '../ImageUploader';
import { createMockFile, getByAcceptingDroppableFiles } from '@/utils/test-utils';
import { jest, expect, describe, test, beforeEach } from '@jest/globals';
import '@testing-library/jest-dom';

// Add type assertion to fix TypeScript errors
const expectWithDOM = expect as any;

describe('ImageUploader', () => {
  const mockOnImageSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders upload interface correctly', () => {
    render(<ImageUploader onImageSelect={mockOnImageSelect} />);
    expectWithDOM(screen.getByText(/Upload your meal photo/i)).toBeInTheDocument();
    expectWithDOM(screen.getByText(/Drag and drop/i)).toBeInTheDocument();
    expectWithDOM(screen.getByRole('button', { name: /Select Image/i })).toBeInTheDocument();
  });

  test('handles valid image upload via input', async () => {
    const { container } = render(<ImageUploader onImageSelect={mockOnImageSelect} />);
    const file = createMockFile();
    const input = getByAcceptingDroppableFiles(container);

    const originalFileReader = global.FileReader;
    const mockFileReaderInstance = {
      readAsDataURL: jest.fn(),
      onload: null,
      result: 'data:image/jpeg;base64,mockbase64string'
    };

    global.FileReader = jest.fn(() => mockFileReaderInstance) as any;

    fireEvent.change(input, { target: { files: [file] } });

    if (mockFileReaderInstance.onload) {
      mockFileReaderInstance.onload({} as any);
    }

    expect(mockOnImageSelect).toHaveBeenCalledWith(file);
    global.FileReader = originalFileReader;
  });

  test('handles invalid file type', async () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const { container } = render(<ImageUploader onImageSelect={mockOnImageSelect} />);
    const file = createMockFile('document.pdf', 'application/pdf');
    const input = getByAcceptingDroppableFiles(container);

    fireEvent.change(input, { target: { files: [file] } });

    expect(alertMock).toHaveBeenCalledWith('Please select an image file');
    expect(mockOnImageSelect).not.toHaveBeenCalled();
    alertMock.mockRestore();
  });

  test('handles drag and drop', async () => {
    render(<ImageUploader onImageSelect={mockOnImageSelect} />);
    const dropZone = screen.getByText(/Drag and drop/).closest('div')!;
    const file = createMockFile();

    const originalFileReader = global.FileReader;
    const mockFileReaderInstance = {
      readAsDataURL: jest.fn(),
      onload: null,
      result: 'data:image/jpeg;base64,mockbase64string'
    };

    global.FileReader = jest.fn(() => mockFileReaderInstance) as any;

    fireEvent.dragOver(dropZone);
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file]
      }
    });

    if (mockFileReaderInstance.onload) {
      mockFileReaderInstance.onload({} as any);
    }

    expect(mockOnImageSelect).toHaveBeenCalledWith(file);
    global.FileReader = originalFileReader;
  });

  test('allows clearing the selected image', async () => {
    const { container } = render(<ImageUploader onImageSelect={mockOnImageSelect} />);
    const file = createMockFile();
    const input = getByAcceptingDroppableFiles(container);

    const originalFileReader = global.FileReader;
    const mockFileReaderInstance = {
      readAsDataURL: jest.fn(),
      onload: null,
      result: 'data:image/jpeg;base64,mockbase64string'
    };

    global.FileReader = jest.fn(() => mockFileReaderInstance) as any;

    fireEvent.change(input, { target: { files: [file] } });

    if (mockFileReaderInstance.onload) {
      mockFileReaderInstance.onload({} as any);
    }

    const clearButton = await screen.findByRole('button');
    fireEvent.click(clearButton);

    expect((input as HTMLInputElement).value).toBe('');
    global.FileReader = originalFileReader;
  });
});
