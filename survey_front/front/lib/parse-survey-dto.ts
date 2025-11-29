import { z } from 'zod'
// zod schema 约束
export const SaveSurveyDto = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  bgImage: z.string().optional(),
  questions: z
    .array(
      z.object({
        id: z.string().optional(),        // 编辑时有值
        title: z.string().min(1),
        type: z.enum(['radio', 'checkbox', 'text', 'rating', 'date']),
        order: z.number().int().default(0),
        required: z.boolean().default(true),
        placeholder: z.string().optional(),
        options: z
          .array(
            z.object({
              id: z.string().optional(),
              label: z.string().min(1),
              value: z.string().min(1),
              order: z.number().int().default(0),
            })
          )
          .optional(),
      })
    )
    .default([]),
})
export type SaveSurveyDtoType = z.infer<typeof SaveSurveyDto>
