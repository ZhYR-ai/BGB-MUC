const { gql } = require('apollo-server-express');

const typeDefs = gql`
  scalar DateTime
  scalar UUID

  type Tag {
    id: UUID!
    name: String!
    createdAt: DateTime!
  }

  type User {
    id: UUID!
    firstName: String!
    lastName: String!
    email: String!
    isAdmin: Boolean!
    hostedEventsCount: Int!
    tags: [Tag!]!
    hostedEvents: [Event!]!
    participatingEvents: [Event!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Event {
    id: UUID!
    name: String!
    description: String
    location: String
    owner: User!
    maxParticipants: Int
    eventDate: DateTime!
    isPublic: Boolean!
    games: [String!]!
    participants: [User!]!
    applicants: [User!]!
    comments: [Comment!]!
    participantCount: Int!
    applicantCount: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Comment {
    id: UUID!
    event: Event!
    user: User!
    content: String!
    parentComment: Comment
    replies: [Comment!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type UserReport {
    id: UUID!
    reporter: User!
    reportedUser: User!
    reason: String
    isBlocked: Boolean!
    createdAt: DateTime!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type PasswordResetRequestResult {
    success: Boolean!
  }

  input RegisterInput {
    firstName: String!
    lastName: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CreateEventInput {
    name: String!
    description: String
    location: String
    maxParticipants: Int
    eventDate: DateTime!
    isPublic: Boolean = true
    games: [String!] = []
  }

  input UpdateEventInput {
    name: String
    description: String
    location: String
    maxParticipants: Int
    eventDate: DateTime
    isPublic: Boolean
    games: [String!]
  }

  input CreateCommentInput {
    eventId: UUID!
    content: String!
    parentCommentId: UUID
  }

  input ReportUserInput {
    reportedUserId: UUID!
    reason: String
    isBlocked: Boolean = false
  }

  type Query {
    # User queries
    me: User
    users: [User!]!
    user(id: UUID!): User

    # Event queries
    events: [Event!]!
    publicEvents: [Event!]!
    event(id: UUID!): Event
    myEvents: [Event!]!
    myParticipatingEvents: [Event!]!

    # Tag queries
    tags: [Tag!]!

    # Comment queries
    eventComments(eventId: UUID!): [Comment!]!

    # Report queries
    myReports: [UserReport!]!
  }

  type Mutation {
    # Authentication
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!

    # Password reset
    requestPasswordReset(email: String!): Boolean!
    resetPassword(token: String!, newPassword: String!): AuthPayload!

    # User management
    assignTag(userId: UUID!, tagId: UUID!): User!
    removeTag(userId: UUID!, tagId: UUID!): User!
    reportUser(input: ReportUserInput!): UserReport!

    # Event management
    createEvent(input: CreateEventInput!): Event!
    updateEvent(id: UUID!, input: UpdateEventInput!): Event!
    deleteEvent(id: UUID!): Boolean!
    joinEvent(eventId: UUID!): Event!
    leaveEvent(eventId: UUID!): Event!
    applyToEvent(eventId: UUID!): Event!
    approveApplication(eventId: UUID!, userId: UUID!): Event!
    rejectApplication(eventId: UUID!, userId: UUID!): Event!

    # Comment management
    createComment(input: CreateCommentInput!): Comment!
    updateComment(id: UUID!, content: String!): Comment!
    deleteComment(id: UUID!): Boolean!

    # Tag management
    createTag(name: String!): Tag!
    deleteTag(id: UUID!): Boolean!
}

  type Subscription {
    eventUpdated(eventId: UUID!): Event!
    commentAdded(eventId: UUID!): Comment!
  }
`;

module.exports = typeDefs;
