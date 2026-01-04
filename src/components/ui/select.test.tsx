/**
 * Select Component Tests
 * Tests for truncation behavior and accessibility in Select dropdowns
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'

describe('Select Touch Optimization (Story 8.4)', () => {
  describe('SelectTrigger - AC 1: Minimum Touch Target Size', () => {
    it('default size has h-11 height class (44px)', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
        </Select>
      )
      const trigger = screen.getByTestId('trigger')
      expect(trigger.className).toContain('data-[size=default]:h-11')
    })

    it('sm size has h-10 height class (40px)', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger" size="sm">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
        </Select>
      )
      const trigger = screen.getByTestId('trigger')
      expect(trigger.className).toContain('data-[size=sm]:h-10')
    })
  })

  describe('SelectTrigger - AC 2: Touch Feedback', () => {
    it('has touch-feedback class', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
        </Select>
      )
      const trigger = screen.getByTestId('trigger')
      expect(trigger.className).toContain('touch-feedback')
    })
  })

  describe('SelectTrigger - AC 4: iOS Zoom Prevention', () => {
    it('has text-base class for 16px font size', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
        </Select>
      )
      const trigger = screen.getByTestId('trigger')
      expect(trigger.className).toContain('text-base')
    })
  })

  describe('SelectItem - Touch Optimization', () => {
    it('has min-h-11 class for 44px minimum height', async () => {
      const user = userEvent.setup()
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test" data-testid="item">Test</SelectItem>
          </SelectContent>
        </Select>
      )
      await user.click(screen.getByRole('combobox'))
      const item = screen.getByTestId('item')
      expect(item.className).toContain('min-h-11')
    })

    it('has touch-feedback class', async () => {
      const user = userEvent.setup()
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test" data-testid="item">Test</SelectItem>
          </SelectContent>
        </Select>
      )
      await user.click(screen.getByRole('combobox'))
      const item = screen.getByTestId('item')
      expect(item.className).toContain('touch-feedback')
    })

    it('has text-base class for 16px font size', async () => {
      const user = userEvent.setup()
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test" data-testid="item">Test</SelectItem>
          </SelectContent>
        </Select>
      )
      await user.click(screen.getByRole('combobox'))
      const item = screen.getByTestId('item')
      expect(item.className).toContain('text-base')
    })
  })
})

describe('Select Component', () => {
  describe('SelectTrigger', () => {
    it('renders with overflow-hidden class for truncation', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
        </Select>
      )

      const trigger = screen.getByTestId('trigger')
      expect(trigger).toHaveClass('overflow-hidden')
    })

    it('applies truncate to select-value via CSS selector', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select a very long option that should be truncated" />
          </SelectTrigger>
        </Select>
      )

      const trigger = screen.getByTestId('trigger')
      // Check that the class contains the truncate selector for select-value
      expect(trigger.className).toContain('*:data-[slot=select-value]:truncate')
    })

    it('supports size variants', () => {
      const { rerender } = render(
        <Select>
          <SelectTrigger data-testid="trigger" size="default">
            <SelectValue />
          </SelectTrigger>
        </Select>
      )

      expect(screen.getByTestId('trigger')).toHaveAttribute('data-size', 'default')

      rerender(
        <Select>
          <SelectTrigger data-testid="trigger" size="sm">
            <SelectValue />
          </SelectTrigger>
        </Select>
      )

      expect(screen.getByTestId('trigger')).toHaveAttribute('data-size', 'sm')
    })
  })

  describe('SelectContent', () => {
    it('defaults to popper position mode', async () => {
      const user = userEvent.setup()

      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent data-testid="content">
            <SelectItem value="1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )

      // Open the select
      await user.click(screen.getByTestId('trigger'))

      // Content should be rendered in portal with popper classes
      const content = screen.getByTestId('content')
      expect(content).toHaveAttribute('data-slot', 'select-content')
      // Popper mode adds min-width based on trigger width
      expect(content.className).toContain('min-w-[var(--radix-select-trigger-width)]')
    })

    it('has max-width to prevent viewport overflow', async () => {
      const user = userEvent.setup()

      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent data-testid="content">
            <SelectItem value="1">Very long option text</SelectItem>
          </SelectContent>
        </Select>
      )

      await user.click(screen.getByRole('combobox'))

      const content = screen.getByTestId('content')
      expect(content.className).toContain('max-w-[calc(100vw-2rem)]')
    })
  })

  describe('SelectItem', () => {
    it('renders with truncate class on text wrapper', async () => {
      const user = userEvent.setup()

      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test" data-testid="item">
              Test Option
            </SelectItem>
          </SelectContent>
        </Select>
      )

      await user.click(screen.getByRole('combobox'))

      const item = screen.getByTestId('item')
      const truncateSpan = item.querySelector('.truncate')
      expect(truncateSpan).toBeInTheDocument()
    })

    it('has overflow-hidden for proper truncation', async () => {
      const user = userEvent.setup()

      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test" data-testid="item">
              Test Option
            </SelectItem>
          </SelectContent>
        </Select>
      )

      await user.click(screen.getByRole('combobox'))

      const item = screen.getByTestId('item')
      expect(item).toHaveClass('overflow-hidden')
    })

    it('adds title attribute for accessibility when children is string', async () => {
      const user = userEvent.setup()
      const longText = 'This is a very long option text that will be truncated'

      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test" data-testid="item">
              {longText}
            </SelectItem>
          </SelectContent>
        </Select>
      )

      await user.click(screen.getByRole('combobox'))

      const item = screen.getByTestId('item')
      const truncateSpan = item.querySelector('.truncate')
      expect(truncateSpan).toHaveAttribute('title', longText)
    })

    it('uses explicit title prop when provided', async () => {
      const user = userEvent.setup()
      const explicitTitle = 'Explicit Title'

      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test" data-testid="item" title={explicitTitle}>
              <span>Complex content</span>
            </SelectItem>
          </SelectContent>
        </Select>
      )

      await user.click(screen.getByRole('combobox'))

      const item = screen.getByTestId('item')
      const truncateSpan = item.querySelector('.truncate')
      expect(truncateSpan).toHaveAttribute('title', explicitTitle)
    })

    it('does not set title when children is not a string and no title prop', async () => {
      const user = userEvent.setup()

      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test" data-testid="item">
              <span>Complex content</span>
            </SelectItem>
          </SelectContent>
        </Select>
      )

      await user.click(screen.getByRole('combobox'))

      const item = screen.getByTestId('item')
      const truncateSpan = item.querySelector('.truncate')
      expect(truncateSpan).not.toHaveAttribute('title')
    })
  })

  describe('Select Integration', () => {
    it('displays selected value with truncation', async () => {
      const user = userEvent.setup()
      const longOption = 'บริษัท ไทยเอ็นเตอร์เทนเมนต์ จำกัด'

      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="thai">{longOption}</SelectItem>
            <SelectItem value="short">Short</SelectItem>
          </SelectContent>
        </Select>
      )

      // Open and select the long option
      await user.click(screen.getByTestId('trigger'))
      await user.click(screen.getByText(longOption))

      // Trigger should show the selected value
      const trigger = screen.getByTestId('trigger')
      expect(trigger).toHaveTextContent(longOption)
      // Trigger has overflow-hidden to truncate long text
      expect(trigger).toHaveClass('overflow-hidden')
    })
  })
})
