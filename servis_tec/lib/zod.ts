import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const LoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "El correo es obligatorio")
    .email("El correo no es válido"),

  password: z
    .string()
    .min(1, "La contraseña es obligatoria")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const RegisterSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(50, "El nombre es demasiado largo")
      .regex(/^[a-zA-Z\s'-]+$/, "Solo letras, espacios, guiones y apóstrofes"),

    email: z
      .string()
      .trim()
      .min(1, "El correo es obligatorio")
      .email("El correo no es válido"),

    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .max(64, "Máximo 64 caracteres")
      .regex(/[A-Z]/, "La contraseñas debe contener al menos una mayúscula")
      .regex(/[a-z]/, "La contraseñas debe contener al menos una minúscula")
      .regex(/[0-9]/, "La contraseñas debe contener al menos un número"),

    // confirmPassword: z.string(),
  })
// .refine((data) => data.password === data.confirmPassword, {
//   message: "Las contraseñas no coinciden",
//   path: ["confirmPassword"],
// });

export const postSchema = z.object({
  title: z
    .string()
    .min(5, "El título debe tener al menos 5 caracteres"),

  subtitle: z
    .string()
    .min(10, "El subtítulo debe tener al menos 10 caracteres"),

  content: z
    .string()
    .min(50, "El contenido debe tener al menos 50 caracteres"),

  image: z
    .instanceof(File)
    .nullable()                    // permite null
    .optional()                    // o undefined
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      { message: "La imagen no debe pesar más de 5MB" }
    )
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      { message: "Formato de imagen no válido. Usa JPG, PNG o WebP" }
    ),
    
});

export type PostFormData = z.infer<typeof postSchema>;