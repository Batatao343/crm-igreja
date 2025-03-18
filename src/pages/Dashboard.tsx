import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { LogOut, Plus, Loader, RefreshCcw, Calendar, Filter, Download, Trash2, Eye } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, differenceInDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

type Decisao = Database['public']['Tables']['decisoes']['Row'];

const STATUS_OPTIONS = [
  'Contato realizado',
  'Em GDC',
  'Curso de batismo',
  'Aguardando contato'
] as const;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [decisoes, setDecisoes] = useState<Decisao[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filteredDecisoes, setFilteredDecisoes] = useState<Decisao[]>([]);
  const [exporting, setExporting] = useState(false);

  // Filter states
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });
  const [selectedDecisao, setSelectedDecisao] = useState<string>('');
  const [selectedCidade, setSelectedCidade] = useState<string>('');
  const [searchNome, setSearchNome] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedDesejaGdc, setSelectedDesejaGdc] = useState<boolean | null>(null);

  const fetchDecisoes = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('decisoes')
        .select('*')
        .gte('data_decisao', dateRange.start)
        .lte('data_decisao', dateRange.end)
        .order('data_decisao', { ascending: false });

      if (selectedDecisao) {
        query = query.eq('decisao', selectedDecisao);
      }

      if (selectedCidade) {
        query = query.ilike('cidade', `%${selectedCidade}%`);
      }

      if (searchNome) {
        query = query.ilike('nome', `%${searchNome}%`);
      }

      if (selectedStatus) {
        query = query.eq('status', selectedStatus);
      }

      if (selectedDesejaGdc !== null) {
        query = query.eq('deseja_gdc', selectedDesejaGdc);
      }

      const { data, error } = await query;

      if (error) throw error;
      setDecisoes(data || []);
      setFilteredDecisoes(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar decisões');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecisoes();
  }, [dateRange.start, dateRange.end, selectedDecisao, selectedCidade, searchNome, selectedStatus, selectedDesejaGdc]);

  const exportToCSV = () => {
    setExporting(true);
    try {
      // CSV Header
      const headers = [
        'Data',
        'Nome',
        'Decisão',
        'Estado Civil',
        'Data de Nascimento',
        'Email',
        'Cidade',
        'Estado',
        'Bairro',
        'Celular',
        'Celebração',
        'Celebração Extra'
      ].join(',');

      // CSV Rows
      const rows = filteredDecisoes.map(decisao => {
        return [
          format(new Date(decisao.data_decisao), 'dd/MM/yyyy'),
          `"${decisao.nome}"`,
          `"${decisao.decisao}"`,
          `"${decisao.estado_civil || ''}"`,
          decisao.nascimento ? format(new Date(decisao.nascimento), 'dd/MM/yyyy') : '',
          `"${decisao.email || ''}"`,
          `"${decisao.cidade || ''}"`,
          `"${decisao.estado || ''}"`,
          `"${decisao.bairro || ''}"`,
          `"${decisao.celular || ''}"`,
          `"${decisao.celebracao || ''}"`,
          `"${decisao.celebracao_extra || ''}"`,
        ].join(',');
      }).join('\n');

      // Complete CSV content
      const csvContent = `\uFEFF${headers}\n${rows}`; // UTF-8 BOM for Excel

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `decisoes_${format(new Date(), 'dd-MM-yyyy')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Erro ao exportar dados');
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  };

  // Chart data preparations
  const decisoesPorTipo = filteredDecisoes.reduce((acc, decisao) => {
    acc[decisao.decisao] = (acc[decisao.decisao] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = Object.entries(decisoesPorTipo).map(([name, value]) => ({
    name,
    value,
  }));

  const decisoesPorCelebracao = filteredDecisoes.reduce((acc, decisao) => {
    if (decisao.celebracao) {
      acc[decisao.celebracao] = (acc[decisao.celebracao] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const barChartData = Object.entries(decisoesPorCelebracao).map(([name, value]) => ({
    name,
    quantidade: value,
  }));

  const decisoesPorTempo = filteredDecisoes.reduce((acc, decisao) => {
    const date = format(new Date(decisao.data_decisao + 'T00:00:00'), 'yyyy-MM-dd');
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const lineChartData = Object.entries(decisoesPorTempo)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({
      date: format(new Date(date + 'T00:00:00'), 'dd/MM', { locale: ptBR }),
      quantidade: count,
    }));

  const statusChartData = Object.entries(
    filteredDecisoes.reduce((acc, decisao) => {
      const status = decisao.status || 'Aguardando contato';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer logout');
    }
  };

  const uniqueCidades = Array.from(new Set(decisoes.map(d => d.cidade || ''))).filter(cidade => cidade !== '');
  const tiposDecisao = Array.from(new Set(decisoes.map((d) => d.decisao)));

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={exportToCSV}
                disabled={exporting || filteredDecisoes.length === 0}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exporting ? (
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Exportar CSV
              </button>
              <button
                onClick={() => navigate('/atualizar-status')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Atualizar Status
              </button>
              <button
                onClick={() => navigate('/remover-entrada')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remover Entrada
              </button>
              <button
                onClick={() => navigate('/visualizar-cadastro')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                <Eye className="w-4 h-4 mr-2" />
                Visualizar Cadastro
              </button>
              <button
                onClick={() => navigate('/cadastro')}
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

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Filtros</h2>
            <button
              onClick={fetchDecisoes}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <RefreshCcw className="w-4 h-4 mr-1" />
              Atualizar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Inicial
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Final
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Decisão
              </label>
              <select
                value={selectedDecisao}
                onChange={(e) => setSelectedDecisao(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas</option>
                {tiposDecisao.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cidade
              </label>
              <select
                value={selectedCidade}
                onChange={(e) => setSelectedCidade(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas</option>
                {uniqueCidades.map((cidade) => (
                  <option key={cidade} value={cidade}>
                    {cidade}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={selectedStatus || ''}
                onChange={(e) => setSelectedStatus(e.target.value as string || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos</option>
                <option value="Contato realizado">Contato realizado</option>
                <option value="Aguardando contato">Aguardando contato</option>
                <option value="Não retornou o contato">Não retornou o contato</option>
                <option value="Encaminhado para GDC">Encaminhado para GDC</option>
                <option value="Encaminhado para batismo">Encaminhado para batismo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deseja GDC
              </label>
              <select
                value={selectedDesejaGdc === null ? '' : selectedDesejaGdc.toString()}
                onChange={(e) => setSelectedDesejaGdc(e.target.value === '' ? null : e.target.value === 'true')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos</option>
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Total de Decisões</h3>
            <p className="text-3xl font-bold text-blue-600">{decisoes.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Decisões no Período</h3>
            <p className="text-3xl font-bold text-green-600">{filteredDecisoes.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Média por Dia</h3>
            <p className="text-3xl font-bold text-purple-600">
              {filteredDecisoes.length > 0
                ? (filteredDecisoes.length / (differenceInDays(parseISO(dateRange.end), parseISO(dateRange.start)) + 1)).toFixed(1)
                : '0'}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Line Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Decisões ao Longo do Tempo</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
                  <YAxis
                    allowDecimals={false}
                    domain={[
                      (dataMin: number) => Math.max(0, dataMin - 1),
                      (dataMax: number) => dataMax + 1
                    ]}
                  />
                  <Tooltip />
                  <Line type="monotone" dataKey="quantidade" stroke="#3B82F6" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart - Tipos de Decisão */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Distribuição por Tipo</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          index % 5 === 0 ? '#22C55E' :  // Verde
                          index % 5 === 1 ? '#0EA5E9' :  // Azul
                          index % 5 === 2 ? '#A855F7' :  // Roxo
                          index % 5 === 3 ? '#F59E0B' :  // Âmbar
                          '#EC4899'                      // Rosa
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart - Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Distribuição por Status</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          entry.name === 'Contato realizado' ? '#22C55E' :
                          entry.name === 'Encaminhado para GDC' ? '#0EA5E9' :
                          entry.name === 'Encaminhado para batismo' ? '#A855F7' :
                          entry.name === 'Não retornou o contato' ? '#EF4444' :
                          '#F59E0B'
                        } 
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Decisões por Celebração</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantidade">
                    {barChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          index % 5 === 0 ? '#22C55E' :  // Verde
                          index % 5 === 1 ? '#0EA5E9' :  // Azul
                          index % 5 === 2 ? '#A855F7' :  // Roxo
                          index % 5 === 3 ? '#F59E0B' :  // Âmbar
                          '#EC4899'                      // Rosa
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden mt-8">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Últimas Decisões</h2>
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={searchNome}
                onChange={(e) => setSearchNome(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredDecisoes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhuma decisão encontrada para os filtros selecionados.
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
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deseja GDC
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Encaminhado para o GDC
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contato
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDecisoes.map((decisao) => (
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          decisao.status === 'Contato realizado' ? 'bg-green-100 text-green-800' :
                          decisao.status === 'Encaminhado para GDC' ? 'bg-blue-100 text-blue-800' :
                          decisao.status === 'Encaminhado para batismo' ? 'bg-purple-100 text-purple-800' :
                          decisao.status === 'Não retornou o contato' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {decisao.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          decisao.deseja_gdc ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {decisao.deseja_gdc ? 'Sim' : 'Não'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {decisao.gdc_encaminhado || '-'}
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
};

export default Dashboard;