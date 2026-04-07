import '@testing-library/jest-dom'
import { screen, render, waitFor } from '@testing-library/react'
import { getServerSession } from "next-auth";
import Page from '@/app/booking/page';
import * as GetUserProfile from '@/libs/getUserProfile';


// Mock getServerSession to return a valid session
jest.mock("next-auth", () => {
  return {
    __esModule: true,
    getServerSession: jest.fn(() => {
      return Promise.resolve({
        expires: new Date(Date.now() + 2 * 86400).toISOString(),
        user: { name: "Alice", token: "xxxxxxxxxxxxxxxxx" }
      });
    }),
  };
});

// Mock getUserProfile with relative path
jest.mock('../src/libs/getUserProfile', () => {
  return jest.fn(() => {
    const userObj = {
      "success": true,
      "data": {
        "_id": "67d2b3071e59d13be2c033a6",
        "name": "Alice",
        "email": "alice@eventplanner.com",
        "tel": "0854439954",
        "role": "user",
        "createdAt": "2025-03-13T10:27:19.226+00:00",
        "__v": 0
      }
    };
    return Promise.resolve(userObj);
  });
});


describe('Banner', () => {
  it('Banner display correct session data', async() => {
    const page = await Page()
    render(page)
    await waitFor(()=>{
      const usernames = screen.getAllByText(/Alice/i)
      expect(usernames.length).toBeGreaterThan(0)
    })
  })
})