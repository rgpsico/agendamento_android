module.exports = {
  devServer: {
    proxy: {
      "/api": {
        target: "https://agendamento.rjpasseios.com.br",
        changeOrigin: true,
        secure: true
      }
    }
  }
};
