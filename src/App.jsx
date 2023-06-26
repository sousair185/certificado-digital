// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import * as asn1js from 'asn1js';
import { Certificate } from 'pkijs';

function App() {
  const [certificateInfo, setCertificateInfo] = useState(null);
  const [timestamp, setTimestamp] = useState(null);

  async function handleAuthentication() {
    try{
      // Busca o arquivo de certificado digital com a extensão .cer no computador do usuário
      const certificateFile = await getCertificateFileFromComputer();
      // Extrai informações do arquivo de certificado digital
      const info = await extractCertificateInfo(certificateFile);
      // Atualiza o estado do componente com as informações extraídas do certificado digital
      setCertificateInfo(info);
      // Atualiza o estado do componente com a data e hora atual
      setTimestamp(new Date());

    }catch(error){setCertificateInfo({ error: 'Houve um erro na obtenção de dados. Favor verificar o arquivo selecionado.' });}
  }

  async function getCertificateFileFromComputer() {
    // Lógica para solicitar ao usuário que selecione o arquivo de certificado digital com a extensão .cer
    const fileHandle = await window.showOpenFilePicker({
      types: [
        {
          description: 'Arquivos de Certificado Digital',
          accept: {
            'application/x-x509-ca-cert': ['.cer']
          }
        }
      ]
    });
    const file = await fileHandle[0].getFile();
    return file;
  }

  async function extractCertificateInfo(certificateFile) {
    // Lê o conteúdo do arquivo de certificado digital
    const fileContents = await certificateFile.arrayBuffer();

    // Converte o conteúdo do arquivo em uma estrutura ASN.1
    const asn1 = asn1js.fromBER(fileContents);

    // Converte a estrutura ASN.1 em um objeto Certificate do pkijs
    const certificate = new Certificate({ schema: asn1.result });

    // Extrai informações do certificado digital
    const info = {
      subject: certificate.subject.typesAndValues
        .map(typeAndValue => typeAndValue.value.valueBlock.value)
        .join(' '),
      notAfter: certificate.notAfter.value
    };
    return info;
  }

  return (
  <div className="container-certificado">
    <button onClick={handleAuthentication}>Autenticar com Certificado Digital</button>
    {certificateInfo && certificateInfo.error && <div>{certificateInfo.error}</div>}
    {certificateInfo && !certificateInfo.error && (
      <div className="dados-certificado">
        <div>Requerente: {certificateInfo.subject}</div>
        <div>Validade: {certificateInfo.notAfter.toLocaleDateString()}</div>
        <div>Data e Hora: {timestamp.toLocaleString()}</div>
      </div>
    )}
  </div>
);
}

export default App;
