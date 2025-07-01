export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          client: string
          client_id: string | null
          color: string
          created_at: string | null
          date: string
          duration: number
          email: string | null
          employee_id: number
          id: string
          notes: string | null
          phone: string | null
          service_type: string
          time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          client: string
          client_id?: string | null
          color: string
          created_at?: string | null
          date: string
          duration?: number
          email?: string | null
          employee_id: number
          id?: string
          notes?: string | null
          phone?: string | null
          service_type: string
          time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          client?: string
          client_id?: string | null
          color?: string
          created_at?: string | null
          date?: string
          duration?: number
          email?: string | null
          employee_id?: number
          id?: string
          notes?: string | null
          phone?: string | null
          service_type?: string
          time?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      custom_services: {
        Row: {
          created_at: string | null
          id: string
          service_categories: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          service_categories: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          service_categories?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          color: string
          created_at: string | null
          id: number
          name: string
          specialization: string
          updated_at: string | null
          vacations: string[] | null
        }
        Insert: {
          color: string
          created_at?: string | null
          id?: number
          name: string
          specialization: string
          updated_at?: string | null
          vacations?: string[] | null
        }
        Update: {
          color?: string
          created_at?: string | null
          id?: number
          name?: string
          specialization?: string
          updated_at?: string | null
          vacations?: string[] | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      recurring_treatments: {
        Row: {
          client_id: string
          created_at: string | null
          duration: number
          employee_id: number
          end_date: string | null
          frequency_type: string
          frequency_value: number
          id: string
          is_active: boolean | null
          notes: string | null
          preferred_day_of_month: number | null
          preferred_day_of_week: number | null
          preferred_time: string | null
          service_type: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          duration?: number
          employee_id: number
          end_date?: string | null
          frequency_type: string
          frequency_value?: number
          id?: string
          is_active?: boolean | null
          notes?: string | null
          preferred_day_of_month?: number | null
          preferred_day_of_week?: number | null
          preferred_time?: string | null
          service_type: string
          start_date: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          duration?: number
          employee_id?: number
          end_date?: string | null
          frequency_type?: string
          frequency_value?: number
          id?: string
          is_active?: boolean | null
          notes?: string | null
          preferred_day_of_month?: number | null
          preferred_day_of_week?: number | null
          preferred_time?: string | null
          service_type?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_treatments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_treatments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
