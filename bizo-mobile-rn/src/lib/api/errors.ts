import axios from "axios";

import { LaravelErrorResponse, LaravelValidationErrors } from "@/src/lib/api/types";

export type NormalizedApiError = {
  status: number | null;
  message: string;
  fieldErrors: LaravelValidationErrors;
};

const fallbackMessages: Record<number, string> = {
  400: "La demande est invalide.",
  401: "Votre session a expiré. Connectez-vous à nouveau.",
  403: "Vous n'avez pas accès à cette action.",
  404: "Ressource introuvable.",
  409: "Cette action entre en conflit avec l'état actuel.",
  422: "Certains champs sont invalides.",
  429: "Trop de requêtes. Réessayez dans un instant.",
  500: "Le serveur a rencontré une erreur.",
};

export function normalizeApiError(error: unknown): NormalizedApiError {
  if (!axios.isAxiosError<LaravelErrorResponse>(error)) {
    return {
      fieldErrors: {},
      message: "Une erreur inattendue est survenue.",
      status: null,
    };
  }

  if (!error.response) {
    return {
      fieldErrors: {},
      message: "Connexion impossible. Vérifiez votre réseau.",
      status: null,
    };
  }

  const status = error.response.status;
  const data = error.response.data;
  const firstValidationMessage = data?.errors ? Object.values(data.errors).flat()[0] : undefined;

  return {
    fieldErrors: data?.errors ?? {},
    message: firstValidationMessage ?? data?.message ?? fallbackMessages[status] ?? "Une erreur est survenue.",
    status,
  };
}
