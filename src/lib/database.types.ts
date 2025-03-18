export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      decisoes: {
        Row: {
          id: number
          nome: string
          decisao: string
          data_decisao: string
          estado_civil: string | null
          nascimento: string | null
          email: string | null
          cidade: string | null
          estado: string | null
          bairro: string | null
          celular: string | null
          celebracao: string | null
          celebracao_extra: string | null
          user_id: string
          created_at: string
          status: string
          deseja_gdc: boolean
          observacao: string | null
          cadastrado_por: string
          gdc_encaminhado: string | null
          nome_cadastrante: string
        }
        Insert: {
          id?: number
          nome: string
          decisao: string
          data_decisao?: string
          estado_civil?: string | null
          nascimento?: string | null
          email?: string | null
          cidade?: string | null
          estado?: string | null
          bairro?: string | null
          celular?: string | null
          celebracao?: string | null
          celebracao_extra?: string | null
          user_id: string
          created_at?: string
          status?: string
          deseja_gdc?: boolean
          observacao?: string | null
          cadastrado_por?: string
          gdc_encaminhado?: string | null
          nome_cadastrante: string
        }
        Update: {
          id?: number
          nome?: string
          decisao?: string
          data_decisao?: string
          estado_civil?: string | null
          nascimento?: string | null
          email?: string | null
          cidade?: string | null
          estado?: string | null
          bairro?: string | null
          celular?: string | null
          celebracao?: string | null
          celebracao_extra?: string | null
          user_id?: string
          created_at?: string
          status?: string
          deseja_gdc?: boolean
          observacao?: string | null
          cadastrado_por?: string
          gdc_encaminhado?: string | null
          nome_cadastrante?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}