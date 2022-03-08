import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { AlertService } from "src/app/resources/services/alert.service";
import { ClienteService } from "src/app/resources/services/cliente.service";
import { Cliente } from "../Cliente";

import { jsPDF } from "jspdf";

// declare let jsPDF;

@Component({
  selector: "app-cliente-lista",
  templateUrl: "./cliente-lista.component.html",
  styleUrls: ["./cliente-lista.component.css"],
  providers: [{ provide: "Window", useValue: window }],
})
export class ClienteListaComponent implements OnInit {
  clients: Cliente[] = [];
  clienteSelecionado: Cliente = null;
  mensagemSucesso: string;
  mensagemErro: string;

  displayedColumns: string[] = [
    "quadra",
    "numero",
    "tipo",
    "nome",
    "endereco",
    "acoes",
  ];
  dataSource: MatTableDataSource<Cliente> = null;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) matSort: MatSort;

  constructor(
    private service: ClienteService,
    private router: Router,
    private alertService: AlertService,
    @Inject("Window") private window: Window
  ) {}

  ngOnInit(): void {
    this.service.getCliente().subscribe((response) => {
      this.clients = response;
      this.dataSource = new MatTableDataSource<Cliente>(this.clients);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.matSort;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  novoCadastro() {
    this.router.navigate(["/cliente-form"]);
  }
  preparaDelecao(cliente: Cliente) {
    this.clienteSelecionado = cliente;
  }

  deletarCliente() {
    this.service.deletar(this.clienteSelecionado).subscribe(
      (response) => {
        this.alertService.success(
          "Maravilha",
          "Você optou por excluir esse cliente!"
        );
        this.ngOnInit();
      },
      (errorResponse) => {
        this.alertService.error(errorResponse.error.message);
      }
    );
  }

  gerarPDF(cliente) {
    let documento = new jsPDF("landscape");

    this.left(documento, cliente);
    this.right(documento, cliente);

    // CASO QUEIRA SOMENTE SALVAR O PDF
    // documento.save("carteira");
    
    // CASO QUEIRA IMPRIMIR DIRETO
    documento.autoPrint();
    documento.output("dataurlnewwindow");
  }


  left(documento: any, cliente: Cliente) {
    documento.setDrawColor(0);
    documento.setFillColor(255, 255, 255);
    documento.roundedRect(4, 4, 135, 95, 3, 3, "FD");

    //INPUT ENDERECO
     this.input(documento, 10, 10, 125, 8, "ENDERECO", 12, 15);
     // NOME ENDERECO
     this.inputText(documento, 14, cliente.endereco, 33, 15);

    // INPUT CIDADE
    this.input(documento, 10, 20, 40, 8, "CIDADE", 12, 25);
    // NOME CIDADE
    this.inputText(documento, 14, cliente.cidade, 27, 25);

    // INPUT UF
    this.input(documento, 52, 20, 15, 8, "UF", 53, 25);
    // NOME UF
    this.inputText(documento, 14, cliente.estado, 58, 25);

    // INPUT BAIRRO/DISTRITO
    this.input(documento, 70, 20, 60, 6, "BAIRRO/DISTRITO", 73, 23);
    // NOME BAIRRO/DISTRITO
    this.inputText(documento, 12, cliente.bairro, 84, 27);

    // INPUT CEP
    this.input(documento, 10, 30, 60, 6, "CEP", 12, 33);
    // NOME CEP
    this.inputText(documento, 12, cliente.CEP === null || cliente.CEP === undefined ?  "--" :  cliente.CEP.toString(), 30, 36);

    // INPUT FONE
    this.input(documento, 72, 30, 60, 6, "FONE", 75, 33);
    // NOME FONE
    this.inputText(documento, 12, cliente.contato === null || cliente.contato === undefined ? "--" :  cliente.contato.toString(), 78, 36);   

    // NOME TEXTO 
    this.inputText(documento, 13, "Ao portado desta carteira de identidade, serão", 22, 55);  
    this.inputText(documento, 13, "concedidos os direitos e deveres ao qual lhe", 22, 59);  
    this.inputText(documento, 13, "confere a Associação Filantrópica do Cemirério", 22, 63);  
    this.inputText(documento, 13, "Santa Rita", 22, 67);
  }

  header(documento) {
    documento.setFont("Courier", "bold");
    // documento.setFontStyles("bold");
    documento.setFontSize(14);
    documento.text("Associação Filantrópica do", 189, 10);
    documento.text("   Cemitério Santa Rita", 189, 19);
    documento.addImage("../../../../assets/logo.jpg", "JPEG", 145, 13, 50, 30);

    documento.setFontSize(8);
    documento.text("Fundada em 14/11/2009", 200, 25);
    documento.text("CPNJ 11.347.229/0001-13", 200, 29);
    documento.text("Av. Sargento Herminio, 1628", 200, 33);
  }

   right(documento, cliente: Cliente) {

     // RIGHT
     documento.setDrawColor(0);
     documento.setFillColor(255, 255, 255);
     documento.roundedRect(140, 4, 135, 95, 3, 3, "FD");
     
     this.header(documento);

    //TITULO SÓCIO
    this.inputText(documento, 20, "SÓCIO CONTRIBUINTE", 175, 50);

    // INPUT TITULAR
    this.input(documento, 145, 55, 125, 8, "TITULAR", 150, 60);
    // NOME SOCIO
    this.inputText(documento, 18, cliente.nome , 165, 62);

    // INPUT QUADRA
    this.input(documento, 145, 65, 25, 8, "QUADRA", 150, 70);
    // NOME QUADRA
    this.inputText(documento, 16, cliente.quadra, 163, 71);

    // INPUT TIPO
    this.input(documento, 171, 65, 40, 8, "TIPO", 172, 70);
    // NOME TIPO
    this.inputText(documento, 16, cliente.tipo, 181, 71);

    // INPUT Nº CONTRIBUINTE
    this.input(documento, 212, 65, 57, 8, "Nº CONTRIBUINTE", 214, 70);
    // NOME Nº CONTRIBUINTE
    this.inputText(documento, 16, "G0344", 243, 71);

    documento.addImage("../../../../assets/Assinaturas.png", "JPEG", 185, 80, 40, 20);

    // NOME Assinatura do Presidente
    this.inputText(documento, 8, "Assinatura do Presidente", 185, 95);  
   }

  input(
    documento,
    a,
    b,
    c,
    fontSize: number,
    text: string,
    x: number,
    y: number
  ) {
    documento.setDrawColor(0);
    documento.setFillColor(255, 255, 255);
    documento.roundedRect(a, b, c, 9, 3, 3, "FD");
    this.inputText(documento, fontSize, text, x, y);
  }

  inputText(documento, fontSize, text, x, y) {
    documento.setFontSize(fontSize);
    documento.text(text, x, y);
  }

  gerarCertificado(cliente) {
    let documento = new jsPDF("landscape");

    this.left(documento, cliente);
    this.right(documento, cliente);

    // CASO QUEIRA SOMENTE SALVAR O PDF
    // documento.save("carteira");
    
    // CASO QUEIRA IMPRIMIR DIRETO
    documento.autoPrint();
    documento.output("dataurlnewwindow");
  }
}
