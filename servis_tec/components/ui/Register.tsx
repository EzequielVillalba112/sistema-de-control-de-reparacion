"use client";
import { RegisterSchema } from "@/lib/zod";
import FormAuth from "../forms/FormsAuth";
import { useState } from "react";
import { registerAction } from "@/actions/auth";
import { toast } from "sonner";

const RegisterForm = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});

  const [errorsRegister, setErrorsRegister] = useState({
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

    const result = RegisterSchema.safeParse(form);

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

    const res = await registerAction(form);

    if (res?.success === false) {
      setErrorsRegister({ message: res.error as string, status: true });
      return;
    }

    toast.success("¡Registro completado!", {
      description: "Tu cuenta está lista. ¡Iniciar Sesión!",
      icon: "🎉",
      duration: 7000,
      position: "top-center",
      action: {
        label: "Entrar ahora",
        onClick: () => (window.location.href = "/dashboard"),
      },
      
    });

    setErrorsRegister({ message: "", status: false });
    setErrors({});
  };

  return (
    <div className="flex w-2/3 flex-col items-center gap-4">
      <FormAuth
        textTitle="Registrarse"
        textButton="Registrarse"
        values={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        errors={errors}
        errorLogReg={errorsRegister}
      />
    </div>
  );
};

export default RegisterForm;
