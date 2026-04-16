import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SummaryViewer from '../components/summaries/SummaryViewer';

describe('SummaryViewer', () => {
  it('renders summary text correctly', () => {
    const testText = 'This is a test summary';
    render(<SummaryViewer summary_text={testText} />);
    expect(screen.getByText(testText)).toBeInTheDocument();
  });

  it('handles null summary_text gracefully', () => {
    render(<SummaryViewer summary_text={null} />);
    expect(screen.getByText(/Error: Summary content not found/i)).toBeInTheDocument();
  });

  it('handles undefined summary_text gracefully', () => {
    render(<SummaryViewer summary_text={undefined} />);
    expect(screen.getByText(/Error: Summary content not found/i)).toBeInTheDocument();
  });

  it('handles empty string summary_text', () => {
    render(<SummaryViewer summary_text="" />);
    expect(screen.getByText(/Error: Summary content not found/i)).toBeInTheDocument();
  });

  it('handles object type summary_text by converting to JSON', () => {
    const testObject = { summary: 'test', data: [1, 2, 3] };
    render(<SummaryViewer summary_text={testObject} />);
    expect(screen.getByText(/\{\"summary\":\"test\",\"data\":\[1,2,3\]\}/)).toBeInTheDocument();
  });
});
