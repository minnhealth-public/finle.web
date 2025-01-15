import { render } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import Todo from './models/todo'

const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    }
})

export function renderWithClient(ui: React.ReactElement) {
    const testQueryClient = createTestQueryClient()
    const { rerender, ...result } = render(
        <QueryClientProvider client={testQueryClient}>{ui}</QueryClientProvider>
    )
    return {
        ...result,
        rerender: (rerenderUi: React.ReactElement) =>
            rerender(
                <QueryClientProvider client={testQueryClient}>{rerenderUi}</QueryClientProvider>
            ),
    }
}

export function renderWithRouter(ui: React.ReactElement) {
    return <MemoryRouter>{ui}</MemoryRouter>;
}

export function createWrapper() {
    const testQueryClient = createTestQueryClient()
    return ({ children }: {children: React.ReactNode}) => (
        <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
    )
}

/*
const dummyTodos: Todo[] = [
  {
    title: "Complete Weekly Report",
    description: "Prepare and submit the weekly progress report to the supervisor. This task involves summarizing the week's activities and achievements to ensure effective communication and accountability within the team.",
    category: "General",
    completed: false,
    relatedVideos: ["video1", "video2"]
  },
  {
    title: "Budget Review",
    description: "Review the monthly budget and track expenses to ensure financial stability. This task is crucial for managing finances efficiently, identifying areas for cost-saving, and planning for future expenses.",
    category: "Financial",
    completed: true,
    relatedVideos: ["video3", "video4"]
  },
  {
    title: "Legal Document Signing",
    description: "Sign legal documents related to property purchase agreement.",
    category: "Legal",
    completed: false,
    relatedVideos: ["video5"]
  },
  {
    title: "Doctor's Appointment",
    description: "Schedule and attend routine medical checkup with the family doctor.",
    category: "Medical",
    completed: false,
    relatedVideos: ["video6"]
  },
  {
    title: "Care Plan Discussion",
    description: "Meet with the care team to discuss and update the care plan for the elderly.",
    category: "Care",
    completed: false,
    relatedVideos: ["video7", "video8"]
  },
  {
    title: "Research caregiving options",
    description: "Research and explore caregiving options for aging parents.",
    category: "Care",
    completed: false,
    relatedVideos: ["video17", "video18"]
  },
  {
    title: "Plan dietary changes",
    description: "Plan and implement dietary changes to improve health outcomes for a family member.",
    category: "Care",
    completed: false,
    relatedVideos: ["video19", "video20"]
  },
  {
    title: "Schedule annual checkups",
    description: "Schedule annual checkups for all family members with their healthcare providers.",
    category: "Medical",
    completed: false,
    relatedVideos: ["video13", "video14"]
  },
  {
    title: "Order prescription refills",
    description: "Order prescription refills for ongoing medications from the pharmacy.",
    category: "Medical",
    completed: false,
    relatedVideos: ["video15", "video16"]
  }
];

export default dummyTodos;
*/
