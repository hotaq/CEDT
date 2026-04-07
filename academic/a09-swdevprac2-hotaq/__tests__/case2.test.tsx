import '@testing-library/jest-dom'
import { screen, render, waitFor } from '@testing-library/react'
import {useSession} from "next-auth/react"
import Banner from '@/components/Banner';

jest.mock("next-auth/react", () => {
  const originalModule = jest.requireActual('next-auth/react');
  const mockSession = {
    expires: new Date(Date.now() + 2 * 86400).toISOString(),
    user: { name: "Alice" }
  };
  return {
    __esModule: true,
    ...originalModule,
    useSession: jest.fn(() => {
      return {data: mockSession, status: 'authenticated'}  // return type is [] in v3 but changed to {} in v4
    }),
  };
});

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(()=> {
    return { push: jest.fn((destination:string)=>null) }
  })
}));

describe('Banner', () => {
  it('Banner display correct session data', () => {
    render(<Banner/>)
    expect(screen.getByText(/Alice/i)).toBeInTheDocument 
  })
})