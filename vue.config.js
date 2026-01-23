module.exports = {
  devServer: {
    proxy: {
      "/api": {
        target: "https://agendamento.rjpasseios.com.br",
        changeOrigin: true,
        secure: true
      },
      "/agendamento": {
        target: "https://agendamento.rjpasseios.com.br",
        changeOrigin: true,
        secure: true
      }
    }
  }
};
