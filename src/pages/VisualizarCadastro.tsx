import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader, ArrowLeft, Search, Eye } from 'lucide-react';
import { Database } from '../lib/database.types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Decisao = Database['public']['Tables']['decisoes']['Row'];

const VisualizarCadastro: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decisoes, setDecisoes] = useState<Decisao[]>([]);
  const [selectedDecisao, setSelectedDecisao] = useState<Decisao | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nome: selectedDecisao?.nome || '',
    celular: selectedDecisao?.celular || '',
    email: selectedDecisao?.email || '',
    cidade: selectedDecisao?.cidade || '',
    data_decisao: selectedDecisao?.data_decisao || '',
    decisao: selectedDecisao?.decisao || '',
    deseja_gdc: selectedDecisao?.deseja_gdc || false,
    nascimento: selectedDecisao?.nascimento || '',
    estado_civil: selectedDecisao?.estado_civil || '',
    estado: selectedDecisao?.estado || '',
    bairro: selectedDecisao?.bairro || '',
    celebracao: selectedDecisao?.celebracao || '',
    celebracao_extra: selectedDecisao?.celebracao_extra || ''
  });
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (selectedDecisao) {
      setFormData({
        nome: selectedDecisao.nome || '',
        celular: selectedDecisao.celular || '',
        email: selectedDecisao.email || '',
        cidade: selectedDecisao.cidade || '',
        data_decisao: selectedDecisao.data_decisao || '',
        decisao: selectedDecisao.decisao || '',
        deseja_gdc: selectedDecisao.deseja_gdc || false,
        nascimento: selectedDecisao.nascimento || '',
        estado_civil: selectedDecisao.estado_civil || '',
        estado: selectedDecisao.estado || '',
        bairro: selectedDecisao.bairro || '',
        celebracao: selectedDecisao.celebracao || '',
        celebracao_extra: selectedDecisao.celebracao_extra || ''
      });
    }
  }, [selectedDecisao]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('decisoes')
        .select('*')
        .ilike('nome', `%${searchTerm}%`)
        .order('data_decisao', { ascending: false });

      if (error) throw error;

      setDecisoes(data || []);
      if (data?.length === 0) {
        setError('Nenhuma decisão encontrada com este nome');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar decisões');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('decisoes')
        .update({
          nome: formData.nome,
          celular: formData.celular,
          email: formData.email,
          cidade: formData.cidade,
          data_decisao: formData.data_decisao,
          decisao: formData.decisao,
          deseja_gdc: formData.deseja_gdc,
          nascimento: formData.nascimento,
          estado_civil: formData.estado_civil,
          estado: formData.estado,
          bairro: formData.bairro,
          celebracao: formData.celebracao,
          celebracao_extra: formData.celebracao_extra
        })
        .eq('id', selectedDecisao?.id);

      if (error) throw error;

      setSuccess('Cadastro atualizado com sucesso!');
      setIsEditing(false);
      setFormData({
        nome: selectedDecisao?.nome || '',
        celular: selectedDecisao?.celular || '',
        email: selectedDecisao?.email || '',
        cidade: selectedDecisao?.cidade || '',
        data_decisao: selectedDecisao?.data_decisao || '',
        decisao: selectedDecisao?.decisao || '',
        deseja_gdc: selectedDecisao?.deseja_gdc || false,
        nascimento: selectedDecisao?.nascimento || '',
        estado_civil: selectedDecisao?.estado_civil || '',
        estado: selectedDecisao?.estado || '',
        bairro: selectedDecisao?.bairro || '',
        celebracao: selectedDecisao?.celebracao || '',
        celebracao_extra: selectedDecisao?.celebracao_extra || ''
      });
    } catch (error) {
      console.error('Erro ao atualizar cadastro:', error);
      setError('Erro ao atualizar cadastro. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Visualizar Cadastro</h1>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          <div className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {decisoes.length > 0 && (
            <div className="space-y-4">
              {decisoes.map((decisao) => (
                <div
                  key={decisao.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedDecisao?.id === decisao.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                  onClick={() => setSelectedDecisao(decisao)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{decisao.nome}</h3>
                      <p className="text-sm text-gray-500">
                        Decisão: {decisao.decisao}
                      </p>
                    </div>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      decisao.status === 'Contato realizado' ? 'bg-green-100 text-green-800' :
                      decisao.status === 'Encaminhado para GDC' ? 'bg-blue-100 text-blue-800' :
                      decisao.status === 'Encaminhado para batismo' ? 'bg-purple-100 text-purple-800' :
                      decisao.status === 'Não retornou o contato' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {decisao.status || 'Aguardando contato'}
                    </span>
                  </div>
                </div>
              ))}

              {selectedDecisao && (
                <div className="mt-6 p-6 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Detalhes do Cadastro
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Informações Pessoais</h4>
                        <dl className="space-y-2">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Nome</dt>
                            <dd className="text-sm text-gray-900">
                              {isEditing ? (
                                <input
                                  type="text"
                                  name="nome"
                                  value={formData.nome}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                              ) : (
                                selectedDecisao.nome
                              )}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Data de Nascimento</dt>
                            <dd className="text-sm text-gray-900">
                              {isEditing ? (
                                <input
                                  type="date"
                                  name="nascimento"
                                  value={formData.nascimento}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                              ) : (
                                selectedDecisao.nascimento ? format(new Date(selectedDecisao.nascimento), 'dd/MM/yyyy', { locale: ptBR }) : '-'
                              )}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Estado Civil</dt>
                            <dd className="text-sm text-gray-900">
                              {isEditing ? (
                                <select
                                  name="estado_civil"
                                  value={formData.estado_civil}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="">Selecione o estado civil</option>
                                  <option value="Solteiro(a)">Solteiro(a)</option>
                                  <option value="Noivo(a)">Noivo(a)</option>
                                  <option value="Casado(a)">Casado(a)</option>
                                  <option value="Divorciado(a)">Divorciado(a)</option>
                                  <option value="Viúvo(a)">Viúvo(a)</option>
                                  <option value="União Estável">União Estável</option>
                                  <option value="Outro">Outro</option>
                                </select>
                              ) : (
                                selectedDecisao.estado_civil || '-'
                              )}
                            </dd>
                          </div>
                        </dl>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Informações de Contato</h4>
                        <dl className="space-y-2">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                            <dd className="text-sm text-gray-900">
                              {isEditing ? (
                                <input
                                  type="email"
                                  name="email"
                                  value={formData.email}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                              ) : (
                                selectedDecisao.email || '-'
                              )}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Celular</dt>
                            <dd className="text-sm text-gray-900">
                              {isEditing ? (
                                <input
                                  type="tel"
                                  name="celular"
                                  value={formData.celular}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                              ) : (
                                selectedDecisao.celular || '-'
                              )}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Cidade</dt>
                            <dd className="text-sm text-gray-900">
                              {isEditing ? (
                                <input
                                  type="text"
                                  name="cidade"
                                  value={formData.cidade}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                              ) : (
                                selectedDecisao.cidade || '-'
                              )}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Estado</dt>
                            <dd className="text-sm text-gray-900">
                              {isEditing ? (
                                <input
                                  type="text"
                                  name="estado"
                                  value={formData.estado}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                              ) : (
                                selectedDecisao.estado || '-'
                              )}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Bairro</dt>
                            <dd className="text-sm text-gray-900">
                              {isEditing ? (
                                <input
                                  type="text"
                                  name="bairro"
                                  value={formData.bairro}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                              ) : (
                                selectedDecisao.bairro || '-'
                              )}
                            </dd>
                          </div>
                        </dl>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Informações da Decisão</h4>
                        <dl className="space-y-2">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Decisão</dt>
                            <dd className="text-sm text-gray-900">
                              {isEditing ? (
                                <select
                                  name="decisao"
                                  value={formData.decisao}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="">Selecione uma decisão</option>
                                  <option value="Aceitar Jesus">Aceitar Jesus</option>
                                  <option value="Reconciliar com Cristo">Reconciliar com Cristo</option>
                                  <option value="Batismo">Batismo</option>
                                  <option value="Quero GDC">Quero GDC</option>
                                </select>
                              ) : (
                                selectedDecisao.decisao
                              )}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Data da Decisão</dt>
                            <dd className="text-sm text-gray-900">
                              {isEditing ? (
                                <input
                                  type="date"
                                  name="data_decisao"
                                  value={formData.data_decisao}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                              ) : (
                                format(new Date(selectedDecisao.data_decisao), 'dd/MM/yyyy', { locale: ptBR })
                              )}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Status</dt>
                            <dd className="text-sm text-gray-900">{selectedDecisao.status}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Deseja GDC</dt>
                            <dd className="text-sm text-gray-900">
                              {isEditing ? (
                                <div className="flex space-x-4">
                                  <label className="inline-flex items-center">
                                    <input
                                      type="radio"
                                      name="deseja_gdc"
                                      checked={formData.deseja_gdc === true}
                                      onChange={() => setFormData(prev => ({ ...prev, deseja_gdc: true }))}
                                      className="form-radio text-blue-600"
                                    />
                                    <span className="ml-2">Sim</span>
                                  </label>
                                  <label className="inline-flex items-center">
                                    <input
                                      type="radio"
                                      name="deseja_gdc"
                                      checked={formData.deseja_gdc === false}
                                      onChange={() => setFormData(prev => ({ ...prev, deseja_gdc: false }))}
                                      className="form-radio text-blue-600"
                                    />
                                    <span className="ml-2">Não</span>
                                  </label>
                                </div>
                              ) : (
                                selectedDecisao.deseja_gdc ? 'Sim' : 'Não'
                              )}
                            </dd>
                          </div>
                          {selectedDecisao.deseja_gdc && (
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Encaminhado para o GDC</dt>
                              <dd className="text-sm text-gray-900">{selectedDecisao.gdc_encaminhado || '-'}</dd>
                            </div>
                          )}
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Nome do cadastrante</dt>
                            <dd className="text-sm text-gray-900">{selectedDecisao.nome_cadastrante}</dd>
                          </div>
                        </dl>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Informações Adicionais</h4>
                        <dl className="space-y-2">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Celebração</dt>
                            <dd className="text-sm text-gray-900">
                              {isEditing ? (
                                <div className="space-y-2">
                                  <select
                                    name="celebracao"
                                    value={formData.celebracao}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    <option value="">Selecione a celebração</option>
                                    <option value="Culto de Celebração">Culto de Celebração</option>
                                    <option value="Culto de Celebração e Comunhão">Culto de Celebração e Comunhão</option>
                                    <option value="Culto de Celebração e Santa Ceia">Culto de Celebração e Santa Ceia</option>
                                    <option value="Culto de Celebração, Comunhão e Santa Ceia">Culto de Celebração, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo">Culto de Celebração e Batismo</option>
                                    <option value="Culto de Celebração, Batismo e Santa Ceia">Culto de Celebração, Batismo e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo, Comunhão e Santa Ceia">Culto de Celebração, Batismo, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Crianças">Culto de Celebração e Batismo de Crianças</option>
                                    <option value="Culto de Celebração, Batismo de Crianças e Santa Ceia">Culto de Celebração, Batismo de Crianças e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Crianças, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Crianças, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Jovens">Culto de Celebração e Batismo de Jovens</option>
                                    <option value="Culto de Celebração, Batismo de Jovens e Santa Ceia">Culto de Celebração, Batismo de Jovens e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Jovens, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Jovens, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Adultos">Culto de Celebração e Batismo de Adultos</option>
                                    <option value="Culto de Celebração, Batismo de Adultos e Santa Ceia">Culto de Celebração, Batismo de Adultos e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Adultos, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Adultos, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Famílias">Culto de Celebração e Batismo de Famílias</option>
                                    <option value="Culto de Celebração, Batismo de Famílias e Santa Ceia">Culto de Celebração, Batismo de Famílias e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Famílias, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Famílias, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Casais">Culto de Celebração e Batismo de Casais</option>
                                    <option value="Culto de Celebração, Batismo de Casais e Santa Ceia">Culto de Celebração, Batismo de Casais e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Casais, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Casais, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Idosos">Culto de Celebração e Batismo de Idosos</option>
                                    <option value="Culto de Celebração, Batismo de Idosos e Santa Ceia">Culto de Celebração, Batismo de Idosos e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Idosos, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Idosos, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas com Deficiência">Culto de Celebração e Batismo de Pessoas com Deficiência</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas com Deficiência e Santa Ceia">Culto de Celebração, Batismo de Pessoas com Deficiência e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas com Deficiência, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas com Deficiência, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Rua">Culto de Celebração e Batismo de Pessoas em Situação de Rua</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Rua e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Rua e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Rua, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Rua, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Vulnerabilidade">Culto de Celebração e Batismo de Pessoas em Situação de Vulnerabilidade</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Vulnerabilidade e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Vulnerabilidade e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Vulnerabilidade, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Vulnerabilidade, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Risco">Culto de Celebração e Batismo de Pessoas em Situação de Risco</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Risco e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Risco e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Risco, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Risco, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Emergência">Culto de Celebração e Batismo de Pessoas em Situação de Emergência</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Emergência e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Emergência e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Emergência, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Emergência, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Calamidade">Culto de Celebração e Batismo de Pessoas em Situação de Calamidade</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Calamidade e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Calamidade e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Calamidade, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Calamidade, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Catástrofe">Culto de Celebração e Batismo de Pessoas em Situação de Catástrofe</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Catástrofe e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Catástrofe e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Catástrofe, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Catástrofe, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Tragédia">Culto de Celebração e Batismo de Pessoas em Situação de Tragédia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Tragédia e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Tragédia e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Tragédia, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Tragédia, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Desastre">Culto de Celebração e Batismo de Pessoas em Situação de Desastre</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Desastre e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Desastre e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Desastre, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Desastre, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Acidente">Culto de Celebração e Batismo de Pessoas em Situação de Acidente</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Acidente e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Acidente e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Acidente, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Acidente, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Incidente">Culto de Celebração e Batismo de Pessoas em Situação de Incidente</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Incidente e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Incidente e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Incidente, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Incidente, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Acontecimento">Culto de Celebração e Batismo de Pessoas em Situação de Acontecimento</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Acontecimento e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Acontecimento e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Acontecimento, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Acontecimento, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Evento">Culto de Celebração e Batismo de Pessoas em Situação de Evento</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Evento e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Evento e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Evento, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Evento, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Ocorrência">Culto de Celebração e Batismo de Pessoas em Situação de Ocorrência</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Ocorrência e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Ocorrência e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Ocorrência, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Ocorrência, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Situação">Culto de Celebração e Batismo de Pessoas em Situação de Situação</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Situação e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Situação e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Situação, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Situação, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Circunstância">Culto de Celebração e Batismo de Pessoas em Situação de Circunstância</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Circunstância e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Circunstância e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Circunstância, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Circunstância, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Condição">Culto de Celebração e Batismo de Pessoas em Situação de Condição</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Condição e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Condição e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Condição, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Condição, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Estado">Culto de Celebração e Batismo de Pessoas em Situação de Estado</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Estado e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Estado e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Estado, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Estado, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Momento">Culto de Celebração e Batismo de Pessoas em Situação de Momento</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Momento e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Momento e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Momento, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Momento, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Fase">Culto de Celebração e Batismo de Pessoas em Situação de Fase</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Fase e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Fase e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Fase, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Fase, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Período">Culto de Celebração e Batismo de Pessoas em Situação de Período</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Período e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Período e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Período, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Período, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Época">Culto de Celebração e Batismo de Pessoas em Situação de Época</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Época e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Época e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Época, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Época, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Tempo">Culto de Celebração e Batismo de Pessoas em Situação de Tempo</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Tempo e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Tempo e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Tempo, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Tempo, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Idade">Culto de Celebração e Batismo de Pessoas em Situação de Idade</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Idade e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Idade e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Idade, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Idade, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Gênero">Culto de Celebração e Batismo de Pessoas em Situação de Gênero</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Gênero e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Gênero e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Gênero, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Gênero, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Raça">Culto de Celebração e Batismo de Pessoas em Situação de Raça</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Raça e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Raça e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Raça, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Raça, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Etnia">Culto de Celebração e Batismo de Pessoas em Situação de Etnia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Etnia e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Etnia e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Etnia, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Etnia, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Nacionalidade">Culto de Celebração e Batismo de Pessoas em Situação de Nacionalidade</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Nacionalidade e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Nacionalidade e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Nacionalidade, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Nacionalidade, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Religião">Culto de Celebração e Batismo de Pessoas em Situação de Religião</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Religião e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Religião e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Religião, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Religião, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Crença">Culto de Celebração e Batismo de Pessoas em Situação de Crença</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Crença e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Crença e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Crença, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Crença, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Fé">Culto de Celebração e Batismo de Pessoas em Situação de Fé</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Fé e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Fé e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Fé, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Fé, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Esperança">Culto de Celebração e Batismo de Pessoas em Situação de Esperança</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Esperança e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Esperança e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Esperança, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Esperança, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Amor">Culto de Celebração e Batismo de Pessoas em Situação de Amor</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Amor e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Amor e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Amor, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Amor, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Paz">Culto de Celebração e Batismo de Pessoas em Situação de Paz</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Paz e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Paz e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Paz, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Paz, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Alegria">Culto de Celebração e Batismo de Pessoas em Situação de Alegria</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Alegria e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Alegria e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Alegria, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Alegria, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Felicidade">Culto de Celebração e Batismo de Pessoas em Situação de Felicidade</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Felicidade e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Felicidade e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Felicidade, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Felicidade, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Contentamento">Culto de Celebração e Batismo de Pessoas em Situação de Contentamento</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Contentamento e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Contentamento e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Contentamento, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Contentamento, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Satisfação">Culto de Celebração e Batismo de Pessoas em Situação de Satisfação</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Satisfação e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Satisfação e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Satisfação, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Satisfação, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Gratidão">Culto de Celebração e Batismo de Pessoas em Situação de Gratidão</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Gratidão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Gratidão e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Gratidão, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Gratidão, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Reconhecimento">Culto de Celebração e Batismo de Pessoas em Situação de Reconhecimento</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Reconhecimento e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Reconhecimento e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Reconhecimento, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Reconhecimento, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Apreciação">Culto de Celebração e Batismo de Pessoas em Situação de Apreciação</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Apreciação e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Apreciação e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Apreciação, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Apreciação, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Valorização">Culto de Celebração e Batismo de Pessoas em Situação de Valorização</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Valorização e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Valorização e Santa Ceia</option>
                                    <option value="Culto de Celebração, Batismo de Pessoas em Situação de Valorização, Comunhão e Santa Ceia">Culto de Celebração, Batismo de Pessoas em Situação de Valorização, Comunhão e Santa Ceia</option>
                                    <option value="Culto de Celebração e Batismo de Pessoas em Situação de Respeito">Culto de Celebração e Batismo de Pessoas em Situação de Respeito</option>
                                  </select>
                                  <input
                                    type="text"
                                    name="celebracao_extra"
                                    value={formData.celebracao_extra}
                                    onChange={handleInputChange}
                                    placeholder="Informação adicional da celebração"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                              ) : (
                                <>
                                  {selectedDecisao?.celebracao || ''}
                                  {selectedDecisao?.celebracao_extra && ` - ${selectedDecisao.celebracao_extra}`}
                                </>
                              )}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Observação</dt>
                            <dd className="text-sm text-gray-900 whitespace-pre-wrap">{selectedDecisao.observacao || '-'}</dd>
                          </div>
                        </dl>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditing(false);
                              setFormData({
                                nome: selectedDecisao.nome || '',
                                celular: selectedDecisao.celular || '',
                                email: selectedDecisao.email || '',
                                cidade: selectedDecisao.cidade || '',
                                data_decisao: selectedDecisao.data_decisao || '',
                                decisao: selectedDecisao.decisao || '',
                                deseja_gdc: selectedDecisao.deseja_gdc || false,
                                nascimento: selectedDecisao.nascimento || '',
                                estado_civil: selectedDecisao.estado_civil || '',
                                estado: selectedDecisao.estado || '',
                                bairro: selectedDecisao.bairro || '',
                                celebracao: selectedDecisao.celebracao || '',
                                celebracao_extra: selectedDecisao.celebracao_extra || ''
                              });
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
                          >
                            {loading ? (
                              <Loader className="w-5 h-5 animate-spin" />
                            ) : (
                              'Salvar Alterações'
                            )}
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsEditing(true)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                        >
                          Editar Cadastro
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualizarCadastro; 