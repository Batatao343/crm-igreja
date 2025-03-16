'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { LogOut, Plus, Loader, RefreshCcw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type Decisao = Database['public']['Tables']['decisoes']['Row'];

export default function Dashboard() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [decisoes, setDecisoes] = useState<Decisao[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchDecisoes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('decisoes')
        .select('*')
        .order('data_decisao', { ascending: false });

      if (error) throw error;
      setDecisoes(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar decisões');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecisoes();
  }, []);

  const decisoesPorTipo = decisoes.reduce((acc, decisao) => {
    acc[decisao.decisao] = (acc[decisao.decisao] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(decisoesPorTipo).map(([name, value]) => ({
    name: name.split(' ')[0],
    quantidade: value,
  }));

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer logout');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/cadastro')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Decisão
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Estatísticas de Decisões</h2>
            <button
              onClick={fetchDecisoes}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <RefreshCcw className="w-4 h-4 mr-1" />
              Atualizar
            </button>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Últimas Decisões</h2>
          </div>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : decisoes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhuma decisão registrada ainda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Decisão
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Celebração
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contato
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {decisoes.map((decisao) => (
                    <tr key={decisao.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(decisao.data_decisao), 'dd/MM/yyyy', { locale: ptBR })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {decisao.nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {decisao.decisao}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {decisao.celebracao}
                        {decisao.celebracao_extra && ` - ${decisao.celebracao_extra}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {decisao.celular && (
                          <div>{decisao.celular}</div>
                        )}
                        {decisao.email && (
                          <div className="text-gray-500">{decisao.email}</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}