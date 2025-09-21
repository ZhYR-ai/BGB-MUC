import { gql } from '@apollo/client';

// Authentication mutations
export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        firstName
        lastName
        email
        isAdmin
        hostedEventsCount
        createdAt
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        firstName
        lastName
        email
        isAdmin
        hostedEventsCount
        createdAt
      }
    }
  }
`;

// Event mutations
export const CREATE_EVENT = gql`
  mutation CreateEvent($input: CreateEventInput!) {
    createEvent(input: $input) {
      id
      name
      description
      location
      eventDate
      isPublic
      maxParticipants
      games
      owner {
        id
        firstName
        lastName
      }
      createdAt
    }
  }
`;

export const UPDATE_EVENT = gql`
  mutation UpdateEvent($id: UUID!, $input: UpdateEventInput!) {
    updateEvent(id: $id, input: $input) {
      id
      name
      description
      location
      eventDate
      isPublic
      maxParticipants
      games
      updatedAt
    }
  }
`;

export const DELETE_EVENT = gql`
  mutation DeleteEvent($id: UUID!) {
    deleteEvent(id: $id)
  }
`;

export const JOIN_EVENT = gql`
  mutation JoinEvent($eventId: UUID!) {
    joinEvent(eventId: $eventId) {
      id
      participantCount
      participants {
        id
        firstName
        lastName
      }
    }
  }
`;

export const LEAVE_EVENT = gql`
  mutation LeaveEvent($eventId: UUID!) {
    leaveEvent(eventId: $eventId) {
      id
      participantCount
      participants {
        id
        firstName
        lastName
      }
    }
  }
`;

export const APPLY_TO_EVENT = gql`
  mutation ApplyToEvent($eventId: UUID!) {
    applyToEvent(eventId: $eventId) {
      id
      applicantCount
      applicants {
        id
        firstName
        lastName
      }
    }
  }
`;

export const APPROVE_APPLICATION = gql`
  mutation ApproveApplication($eventId: UUID!, $userId: UUID!) {
    approveApplication(eventId: $eventId, userId: $userId) {
      id
      participantCount
      applicantCount
      participants {
        id
        firstName
        lastName
      }
      applicants {
        id
        firstName
        lastName
      }
    }
  }
`;

export const REJECT_APPLICATION = gql`
  mutation RejectApplication($eventId: UUID!, $userId: UUID!) {
    rejectApplication(eventId: $eventId, userId: $userId) {
      id
      applicantCount
      applicants {
        id
        firstName
        lastName
      }
    }
  }
`;

// Comment mutations
export const CREATE_COMMENT = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      id
      content
      createdAt
      user {
        id
        firstName
        lastName
      }
      parentComment {
        id
      }
    }
  }
`;

export const UPDATE_COMMENT = gql`
  mutation UpdateComment($id: UUID!, $content: String!) {
    updateComment(id: $id, content: $content) {
      id
      content
      updatedAt
    }
  }
`;

export const DELETE_COMMENT = gql`
  mutation DeleteComment($id: UUID!) {
    deleteComment(id: $id)
  }
`;

// User management mutations
export const ASSIGN_TAG = gql`
  mutation AssignTag($userId: UUID!, $tagId: UUID!) {
    assignTag(userId: $userId, tagId: $tagId) {
      id
      tags {
        id
        name
      }
    }
  }
`;

export const REMOVE_TAG = gql`
  mutation RemoveTag($userId: UUID!, $tagId: UUID!) {
    removeTag(userId: $userId, tagId: $tagId) {
      id
      tags {
        id
        name
      }
    }
  }
`;

export const REPORT_USER = gql`
  mutation ReportUser($input: ReportUserInput!) {
    reportUser(input: $input) {
      id
      reason
      isBlocked
      reportedUser {
        id
        firstName
        lastName
      }
      createdAt
    }
  }
`;

// Tag mutations
export const CREATE_TAG = gql`
  mutation CreateTag($name: String!) {
    createTag(name: $name) {
      id
      name
      createdAt
    }
  }
`;

export const DELETE_TAG = gql`
  mutation DeleteTag($id: UUID!) {
    deleteTag(id: $id)
  }
`;

// Password reset mutations
export const REQUEST_PASSWORD_RESET = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email)
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword) {
      token
      user {
        id
        firstName
        lastName
        email
        isAdmin
        hostedEventsCount
        createdAt
      }
    }
  }
`;
