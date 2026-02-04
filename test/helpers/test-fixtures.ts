export const VALID_TIPTAP_DOC = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Hello world' }],
    },
  ],
};

export const EMPTY_TIPTAP_DOC = {
  type: 'doc',
  content: [],
};

export const COMPLEX_TIPTAP_DOC = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Heading' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'This is ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'bold' },
        { type: 'text', text: ' and ' },
        { type: 'text', marks: [{ type: 'italic' }], text: 'italic' },
      ],
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Item 1' }],
            },
          ],
        },
      ],
    },
  ],
};

export const INVALID_TIPTAP_DOC = {
  type: 'invalid',
  content: 'not an array',
};

export function createMockUser(overrides: Partial<any> = {}) {
  return {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockNote(overrides: Partial<any> = {}) {
  return {
    id: 'note-123',
    user_id: 'user-123',
    title: 'Test Note',
    content_json: JSON.stringify(VALID_TIPTAP_DOC),
    is_public: 0,
    public_slug: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}
