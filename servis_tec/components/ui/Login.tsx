"use client";
import { useState } from "react";
import FormAuth from "../forms/FormsAuth";
import { LoginSchema } from "@/lib/zod";
import { toast } from "sonner";
import { loginUser } from "@/actions/auth";
import { useRouter } from "next/navigation";

const LoginForm = () => {
  const router = useRouter();
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
      const res = await loginUser(form.email, form.password);

      if (res?.success === false) {
        if (res.error) {
          setErrorsLogin({
            message: res.error,
            status: true,
          });
        }
        return;
      }

      toast.success("¡Inicio de sesión exitoso!", {
        description: "Bienvenido de vuelta",
        icon: "🎉",
        duration: 6000,
        position: "top-right",
      });

      router.push("/dashboard");
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
