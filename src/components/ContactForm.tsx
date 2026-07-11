import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowUpRight, Loader2 } from "lucide-react";

const WHATSAPP_NUMBER = "5531993040342";

const INTERESTS = [
  "Edifício Rosário (lançamento)",
  "Imóveis prontos para morar",
  "Personalização de plantas",
  "Outro assunto",
] as const;

const phoneRegex = /^[\d\s()+.-]{8,20}$/;

const schema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, { message: "Informe seu nome completo (mín. 2 caracteres)." })
    .max(100, { message: "Nome muito longo (máx. 100 caracteres)." }),
  telefone: z
    .string()
    .trim()
    .min(8, { message: "Telefone inválido." })
    .max(20, { message: "Telefone inválido." })
    .regex(phoneRegex, { message: "Use apenas números, espaços e (), +, -." }),
  email: z
    .string()
    .trim()
    .email({ message: "E-mail inválido." })
    .max(255, { message: "E-mail muito longo." }),
  interesse: z.enum(INTERESTS, {
    errorMap: () => ({ message: "Selecione um interesse." }),
  }),
  mensagem: z
    .string()
    .trim()
    .max(1000, { message: "Mensagem muito longa (máx. 1000 caracteres)." })
    .optional()
    .or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
      telefone: "",
      email: "",
      interesse: INTERESTS[0],
      mensagem: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const text =
        `Olá! Gostaria de mais informações.\n\n` +
        `*Nome:* ${values.nome}\n` +
        `*Telefone:* ${values.telefone}\n` +
        `*E-mail:* ${values.email}\n` +
        `*Interesse:* ${values.interesse}\n` +
        (values.mensagem ? `*Mensagem:* ${values.mensagem}\n` : "");
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank", "noopener,noreferrer");
      toast.success("Mensagem pronta!", {
        description: "Abrimos o WhatsApp para você concluir o envio.",
      });
      reset();
    } catch {
      toast.error("Não foi possível enviar", {
        description: "Tente novamente ou ligue diretamente para nossa central.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      className="rounded-2xl border border-border bg-card p-8 shadow-sm"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div className="grid gap-5">
        <FieldWrapper label="Nome" required error={errors.nome?.message}>
          <input
            type="text"
            autoComplete="name"
            aria-invalid={!!errors.nome}
            className="input"
            {...register("nome")}
          />
        </FieldWrapper>

        <div className="grid gap-5 sm:grid-cols-2">
          <FieldWrapper label="Telefone" required error={errors.telefone?.message}>
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              aria-invalid={!!errors.telefone}
              className="input"
              placeholder="(31) 99999-9999"
              {...register("telefone")}
            />
          </FieldWrapper>
          <FieldWrapper label="E-mail" required error={errors.email?.message}>
            <input
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              className="input"
              {...register("email")}
            />
          </FieldWrapper>
        </div>

        <FieldWrapper label="Interesse" error={errors.interesse?.message}>
          <select className="input" aria-invalid={!!errors.interesse} {...register("interesse")}>
            {INTERESTS.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </FieldWrapper>

        <FieldWrapper label="Mensagem" error={errors.mensagem?.message}>
          <textarea
            rows={4}
            className="input resize-none"
            aria-invalid={!!errors.mensagem}
            maxLength={1000}
            {...register("mensagem")}
          />
        </FieldWrapper>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
        >
          {submitting ? (
            <>
              Enviando... <Loader2 className="h-4 w-4 animate-spin" />
            </>
          ) : (
            <>
              Enviar mensagem <ArrowUpRight className="h-4 w-4" />
            </>
          )}
        </button>

        <p className="text-xs text-muted-foreground">
          Ao enviar, você será direcionado ao WhatsApp da nossa central de vendas.
        </p>
      </div>
    </form>
  );
}

function FieldWrapper({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label} {required && <span className="text-primary">*</span>}
      </span>
      {children}
      {error && <span className="mt-1.5 block text-xs text-destructive">{error}</span>}
    </label>
  );
}
