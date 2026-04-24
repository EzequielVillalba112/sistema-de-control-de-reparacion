import Link from "next/link";
import IsLoading from "../IsLoading";
type FormAuthProps = {
  textTitle: string;
  textButton: string;
  values: {
    email: string;
    password: string;
    name?: string;
  };
  errors: {
    email?: string;
    password?: string;
    name?: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  errorLogReg?: { message: string; status: boolean };
  isLoading?: boolean;
};

const FormAuth = ({
  textTitle,
  textButton,
  values,
  onChange,
  onSubmit,
  errors,
  errorLogReg,
  isLoading,
}: FormAuthProps) => {
  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-sm mx-auto space-y-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
    >
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl text-center font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {textTitle}
        </h1>
      </div>
      {/* Name solo para registro */}
      {textTitle === "Registrarse" && (
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Nombre
          </label>
          <input
            id="name"
            type="text"
            placeholder="Juan Perez"
            value={values.name}
            name="name"
            onChange={onChange}
            className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900
                 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2
                 focus:ring-zinc-900/20
                 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50
                 dark:placeholder:text-zinc-500 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/20"
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>
      )}
      {/* Email */}
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          placeholder="correo@ejemplo.com"
          value={values.email}
          name="email"
          onChange={onChange}
          className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900
                 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2
                 focus:ring-zinc-900/20
                 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50
                 dark:placeholder:text-zinc-500 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/20"
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          value={values.password}
          name="password"
          onChange={onChange}
          className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900
                 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2
                 focus:ring-zinc-900/20
                 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50
                 dark:placeholder:text-zinc-500 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/20"
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password}</p>
        )}
        {errorLogReg && (
          <p className="text-sm text-red-500">{errorLogReg.message}</p>
        )}
      </div>

      {/* Button */}
      <button
        type="submit"
        className="h-11 w-full rounded-lg !bg-blue-600 text-sm font-medium !text-white
               transition cursor-pointer hover:!bg-blue-700"
      >
        {isLoading ? <IsLoading textloading="Cargando..." /> :  textButton }
      </button>

      {/* Footer */}
      {textTitle === "Registrarse" ? (
        <p className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="font-medium text-zinc-900 hover:underline dark:text-blue-400"
          >
            Inicia sesión
          </Link>
        </p>
      ) : (
        <p className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
          ¿No tienes cuenta?{" "}
          <Link
            href="/register"
            className="font-medium text-zinc-900 hover:underline dark:text-blue-400"
          >
            Regístrate
          </Link>
        </p>
      )}
    </form>
  );
};

export default FormAuth;
