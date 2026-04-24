"use client";
import { useState } from "react";
import FormAuth from "../forms/FormsAuth";
import { LoginSchema } from "@/lib/zod";
import { signIn } from "next-auth/react";

const LoginForm = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const [errorsLogin, setErrorsLogin] = useState({
    message: "",
    status: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = LoginSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors: typeof errors = {};

      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof typeof form;

        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }

      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);
    console.log(form);
    
    try {
      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (res?.error) {
        if (res.error === "CredentialsSignin") {
          setErrorsLogin({
            message: "Correo o contraseña incorrectos",
            status: true,
          });
        } else {
          setErrors({
            email: "Error al iniciar sesión",
            password: "Error al iniciar sesión",
          });
        }
        return;
      }

      //   window.location.href = "/dashboard";
    } catch (error) {
      console.error("Error inesperado en login:", error);
      setErrors({
        email: "Error inesperado al iniciar sesión",
        password: "Error inesperado al iniciar sesión",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-2/3 flex-col items-center gap-4">
      <FormAuth
        textTitle="Iniciar Sesión"
        textButton="Iniciar Sesión"
        values={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        errors={errors}
        errorLogReg={errorsLogin}
        isLoading={isLoading}
      />
    </div>
  );
};

export default LoginForm;
