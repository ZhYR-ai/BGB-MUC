import { gql } from '@apollo/client';

// User queries
export const GET_ME = gql`
  query GetMe {
    me {
      id
      firstName
      lastName
      email
      isAdmin
      hostedEventsCount
      tags {
        id
        name
      }
      createdAt
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      firstName
      lastName
      email
      isAdmin
      hostedEventsCount
      tags {
        id
        name
      }
      createdAt
    }
  }
`;

export const GET_USER = gql`
  query GetUser($id: UUID!) {
    user(id: $id) {
      id
      firstName
      lastName
      email
      isAdmin
      hostedEventsCount
      tags {
        id
        name
      }
      hostedEvents {
        id
        name
        eventDate
        isPublic
        participantCount
      }
      participatingEvents {
        id
        name
        eventDate
        isPublic
        owner {
          firstName
          lastName
        }
      }
      createdAt
    }
  }
`;

// Event queries
export const GET_PUBLIC_EVENTS = gql`
  query GetPublicEvents {
    publicEvents {
      id
      name
      description
      location
      eventDate
      isPublic
      maxParticipants
      participantCount
      applicantCount
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

export const GET_EVENTS = gql`
  query GetEvents {
    events {
      id
      name
      description
      location
      eventDate
      isPublic
      maxParticipants
      participantCount
      applicantCount
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

export const GET_EVENT = gql`
  query GetEvent($id: UUID!) {
    event(id: $id) {
      id
      name
      description
      location
      eventDate
      isPublic
      maxParticipants
      participantCount
      applicantCount
      games
      owner {
        id
        firstName
        lastName
        email
      }
      participants {
        id
        firstName
        lastName
        tags {
          id
          name
        }
      }
      applicants {
        id
        firstName
        lastName
        tags {
          id
          name
        }
      }
      comments {
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
        replies {
          id
          content
          createdAt
          user {
            id
            firstName
            lastName
          }
        }
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_MY_EVENTS = gql`
  query GetMyEvents {
    myEvents {
      id
      name
      description
      location
      eventDate
      isPublic
      maxParticipants
      participantCount
      applicantCount
      games
      createdAt
    }
  }
`;

export const GET_MY_PARTICIPATING_EVENTS = gql`
  query GetMyParticipatingEvents {
    myParticipatingEvents {
      id
      name
      description
      location
      eventDate
      isPublic
      maxParticipants
      participantCount
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

// Tag queries
export const GET_TAGS = gql`
  query GetTags {
    tags {
      id
      name
      createdAt
    }
  }
`;

// Comment queries
export const GET_EVENT_COMMENTS = gql`
  query GetEventComments($eventId: UUID!) {
    eventComments(eventId: $eventId) {
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
      replies {
        id
        content
        createdAt
        user {
          id
          firstName
          lastName
        }
      }
    }
  }
`;

// Report queries
export const GET_MY_REPORTS = gql`
  query GetMyReports {
    myReports {
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
